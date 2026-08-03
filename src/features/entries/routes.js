async function handleRoutes(req, res, user, pathname, ctx) {
  if (pathname === "/api/entries/next-receipt") {
    if (req.method !== "GET") return false;
    try {
      const receiptNumber = await ctx.suggestEntryReceiptNumber();
      ctx.send(res, 200, { receiptNumber });
    } catch (error) {
      ctx.logEvent("error", "Failed to suggest receipt number", {
        route: pathname,
        method: req.method,
        requestId: req.requestId,
        actor: user?.email || user?.username || "",
        error: ctx.serializeError(error)
      });
      ctx.sendError(res, 500, "Unable to allocate next receipt number. Please retry.");
    }
    return true;
  }

  if (pathname === "/api/entries") {
    if (req.method === "GET") {
      const entries = (await ctx.readEntries()).map(ctx.publicEntry);
      ctx.send(res, 200, { entries });
      return true;
    }

    if (req.method === "POST") {
      if (!ctx.requireRole(user, ["staff", "reviewer", "admin"])) {
        ctx.sendError(res, 403, "Only staff, reviewers, and admins can create entries");
        return true;
      }
      const input = await ctx.parseJsonOrForm(req);
      if (!ctx.normalizeSerialNo(input.serialNo)) {
        ctx.sendError(res, 400, "S. No. is required");
        return true;
      }
      if (!ctx.isValidSerialNo(input.serialNo)) {
        ctx.sendError(res, 400, "S. No. must be numeric and up to 3 digits");
        return true;
      }
      const entryId = ctx.crypto.randomUUID();
      const receiptNumber = await ctx.reserveEntryReceiptNumber(input.receiptNumber || "", entryId, user?.email || user?.username || "");
      const requestMeta = {
        requestId: req.requestId,
        route: pathname,
        method: req.method,
        actor: user?.email || user?.username || "",
        receiptNumber
      };
      const entry = await ctx.applyOwnerDetails(await ctx.processEntryPhotos(
        ctx.normalizeEntry({
          ...input,
          receiptNumber,
          id: entryId
        }, user),
        input,
        requestMeta
      ));
      entry.id = entryId;
      const currentEntries = await ctx.readSheetObjects(ctx.SHEETS.entries, ctx.DAILY_ENTRY_COLUMNS, "entries");
      if (currentEntries.some((row) => ctx.normalizeCell(row["Receipt No."] || "").toUpperCase() === ctx.normalizeCell(receiptNumber).toUpperCase())) {
        throw new Error(`Receipt number ${receiptNumber} already exists; please retry.`);
      }
      await ctx.applyEntryAdvanceTransition(null, entry);
      await ctx.appendEntry(entry);
      await ctx.audit(entry.id, user, "created");
      ctx.logEvent("info", "Entry created", {
        ...requestMeta,
        entryId: entry.id,
        ownerName: entry.ownerName,
        vehicleNumber: entry.vehicleNumber
      });
      const nextReceiptNumber = await ctx.suggestEntryReceiptNumber();
      ctx.send(res, 201, { entry: ctx.publicEntry(entry), nextReceiptNumber });
      return true;
    }
  }

  const driveImageMatch = pathname.match(/^\/api\/drive-image\/([^/]+)$/);
  if (driveImageMatch && req.method === "GET") {
    if (!ctx.google.enabled) {
      ctx.sendError(res, 404, "Drive image not available");
      return true;
    }
    const file = await ctx.google.downloadDriveFile(driveImageMatch[1]);
    res.writeHead(200, {
      "Cache-Control": "no-store, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
      "Content-Type": file.contentType
    });
    res.end(file.buffer);
    return true;
  }

  const entryMatch = pathname.match(/^\/api\/entries\/([^/]+)(?:\/(review|download))?$/);
  if (entryMatch) {
    const [, entryId, action] = entryMatch;
    const entries = await ctx.readEntries();
    const requestedEntryId = String(entryId || "").trim().toUpperCase();
    const index = entries.findIndex((entry) => {
      const normalizedId = String(entry.id || "").trim().toUpperCase();
      const normalizedReceipt = String(entry.receiptNumber || "").trim().toUpperCase();
      return normalizedId === requestedEntryId || normalizedReceipt === requestedEntryId;
    });
    if (index === -1) {
      ctx.sendError(res, 404, "Entry not found");
      return true;
    }

    if (action === "download" && req.method === "GET") {
      ctx.send(res, 200, await ctx.entryHtml(entries[index]), {
        "Content-Disposition": `inline; filename="${entries[index].id}.html"`
      });
      return true;
    }

    if (action === "review" && req.method === "POST") {
      if (!ctx.requireRole(user, ["reviewer", "admin"])) {
        ctx.sendError(res, 403, "Only reviewers can approve entries");
        return true;
      }
      const input = await ctx.readJson(req);
      ctx.ensureNoDuplicateReceiptState(entries, entries[index].id);
      const updated = await ctx.applyOwnerDetails(ctx.normalizeEntry({ ...input, status: input.status || "Approved" }, user, entries[index]));
      updated.reviewedBy = user.email;
      updated.reviewedAt = new Date().toISOString();
      updated.status = input.status || "Approved";
      const html = await ctx.entryHtml(updated);
      if (ctx.google.enabled) {
        const file = await ctx.google.uploadHtml(`${updated.id}.html`, html);
        updated.driveFileId = file.id || "";
        updated.driveFileUrl = file.webViewLink || "";
      }
      await ctx.applyEntryAdvanceTransition(entries[index], updated);
      entries[index] = updated;
      await ctx.writeEntries(entries);
      const reviewedTransactions = Array.isArray(updated.transactions) ? updated.transactions : [];
      const reviewedSummary = updated.transactionSummary || ctx.transactionSummary(reviewedTransactions);
      const reviewedTotal = updated.transactionTotal || String(ctx.transactionTotal(reviewedTransactions));
      const reviewedNotes = String(updated.reviewerNotes || "");
      await ctx.upsertReviewedEntry({
        receiptNumber: updated.receiptNumber,
        reviewedAt: updated.reviewedAt,
        status: updated.status,
        reviewedBy: updated.reviewedBy,
        totalAmountInclGst: String(updated.totalAmountInclGst || 0),
        transactionTotal: String(reviewedTotal),
        transactionCount: String(reviewedTransactions.length),
        transactions: reviewedTransactions,
        transactionSummary: reviewedSummary,
        reviewerNotes: reviewedNotes
      });
      await ctx.audit(updated.id, user, `reviewed:${updated.status}`, reviewedNotes);
      ctx.send(res, 200, { entry: ctx.publicEntry(updated) });
      return true;
    }

    if (req.method === "PATCH") {
      if (!ctx.requireRole(user, ["reviewer", "admin"])) {
        ctx.sendError(res, 403, "Only reviewers can edit entries");
        return true;
      }
      const input = await ctx.parseJsonOrForm(req);
      if (!ctx.normalizeSerialNo(input.serialNo ?? entries[index].serialNo)) {
        ctx.sendError(res, 400, "S. No. is required");
        return true;
      }
      if (!ctx.isValidSerialNo(input.serialNo ?? entries[index].serialNo)) {
        ctx.sendError(res, 400, "S. No. must be numeric and up to 3 digits");
        return true;
      }
      ctx.ensureNoDuplicateReceiptState(entries, entries[index].id);
      const nextReceiptNumber = input.receiptNumber
        ? ctx.ensureReceiptNumberAvailable(entries, input.receiptNumber, entries[index].id)
        : entries[index].receiptNumber;
      const updated = await ctx.applyOwnerDetails(await ctx.processEntryPhotos(
        ctx.normalizeEntry({ ...input, receiptNumber: nextReceiptNumber }, user, entries[index]),
        input
      ));
      await ctx.applyEntryAdvanceTransition(entries[index], updated);
      entries[index] = updated;
      await ctx.writeEntries(entries);
      await ctx.audit(updated.id, user, "edited");
      ctx.send(res, 200, { entry: ctx.publicEntry(updated) });
      return true;
    }
  }

  if (pathname === "/api/analytics" && req.method === "GET") {
    if (!ctx.requireRole(user, ["analyst", "admin"])) {
      ctx.sendError(res, 403, "Only analysts can view analytics");
      return true;
    }
    ctx.send(res, 200, ctx.analytics(await ctx.readEntries()));
    return true;
  }

  return false;
}

module.exports = {
  handleRoutes
};
