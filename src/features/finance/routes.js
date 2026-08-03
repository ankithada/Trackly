async function handleRoutes(req, res, user, pathname, ctx) {
  if (pathname === "/api/debit-entries") {
    if (req.method === "GET") {
      ctx.send(res, 200, { debitEntries: await ctx.readDebitEntries() });
      return true;
    }

    if (req.method === "POST") {
      if (!ctx.requireRole(user, ["reviewer", "admin"])) {
        ctx.sendError(res, 403, "Only reviewers can create debit entries");
        return true;
      }
      const input = await ctx.readJson(req);
      const debitEntries = await ctx.readDebitEntries();
      const createdDate = new Date().toISOString().slice(0, 10);
      const debitEntry = {
        debitEntryId: ctx.allocateDebitEntryId(debitEntries),
        date: String(input.date || new Date().toISOString().slice(0, 10)),
        description: String(input.description || "").trim(),
        amount: String(Number(input.amount || 0)),
        category: String(input.category || "Miscellaneous").trim(),
        paymentMode: String(input.paymentMode || "Cash").trim(),
        paidTo: String(input.paidTo || "").trim(),
        notes: String(input.notes || "").trim(),
        createdBy: user.name || user.username || user.email,
        createdDate
      };
      if (!debitEntry.description) {
        ctx.sendError(res, 400, "Description is required");
        return true;
      }
      if (!Number.isFinite(Number(debitEntry.amount)) || Number(debitEntry.amount) <= 0) {
        ctx.sendError(res, 400, "Amount must be greater than 0");
        return true;
      }
      await ctx.appendDebitEntry(debitEntry);
      ctx.send(res, 201, { debitEntry });
      return true;
    }
  }

  if (pathname === "/api/consolidated-entries") {
    if (req.method === "GET") {
      ctx.send(res, 200, { consolidatedEntries: await ctx.readConsolidatedEntries() });
      return true;
    }

    if (req.method === "POST") {
      if (!ctx.requireRole(user, ["reviewer", "admin"])) {
        ctx.sendError(res, 403, "Only reviewers can create consolidated credits");
        return true;
      }
      const input = await ctx.readJson(req);
      const entries = await ctx.readEntries();
      const consolidatedEntries = await ctx.readConsolidatedEntries();
      const entryIds = Array.isArray(input.entryIds) ? input.entryIds.map((value) => String(value)) : [];
      const selectedEntries = entries.filter((entry) => entryIds.includes(entry.id));
      if (!selectedEntries.length) {
        ctx.sendError(res, 400, "Select at least one entry");
        return true;
      }

      const creditEntryId = ctx.allocateCreditEntryId(consolidatedEntries);
      const formEntry = selectedEntries.map((entry) => entry.receiptNumber || entry.id).join(", ");
      const createdDate = new Date().toISOString().slice(0, 10);
      const entryMetadata = selectedEntries.map((entry) => ({
        receiptNo: entry.receiptNumber || entry.id,
        totalAmount: Number(entry.totalAmountInclGst || entry.grossAmount || 0),
        paymentMode: entry.paymentMode || "",
        vehicleCategory: entry.vehicleCategory || "",
        ownerName: entry.ownerName || ""
      }));
      const consolidatedEntry = {
        creditEntryId,
        formEntry,
        totalAmount: String(Number(input.totalAmount || 0)),
        receivedBy: String(input.receivedBy || "").trim(),
        paymentMode: String(input.paymentMode || "Cash").trim(),
        notes: String(input.notes || "").trim(),
        date: new Date().toISOString().slice(0, 10),
        entryMetadata,
        createdBy: user.name || user.username || user.email,
        createdDate
      };
      if (!consolidatedEntry.receivedBy) {
        ctx.sendError(res, 400, "Received By is required");
        return true;
      }
      if (!Number.isFinite(Number(consolidatedEntry.totalAmount)) || Number(consolidatedEntry.totalAmount) <= 0) {
        ctx.sendError(res, 400, "Total Amount must be greater than 0");
        return true;
      }

      await ctx.appendConsolidatedEntry(consolidatedEntry);
      ctx.send(res, 201, { consolidatedEntry });
      return true;
    }
  }

  if (pathname === "/api/owner-advances") {
    if (req.method === "GET") {
      ctx.send(res, 200, { ownerAdvances: await ctx.readOwnerAdvances() });
      return true;
    }

    if (req.method === "POST") {
      if (!ctx.requireRole(user, ["reviewer", "admin"])) {
        ctx.sendError(res, 403, "Only reviewers and admins can create owner advances");
        return true;
      }
      const input = await ctx.readJson(req);
      const ownerName = String(input.ownerName || "").trim();
      const amount = Number(input.amount || 0);
      const paymentMode = String(input.paymentMode || "Cash").trim();
      const notes = String(input.notes || "").trim();
      const date = String(input.date || new Date().toISOString().slice(0, 10)).trim();
      const hasCurrentBalanceInput = input.currentBalance != null && String(input.currentBalance).trim() !== "";
      const currentBalanceInput = hasCurrentBalanceInput
        ? ctx.parseNonNegativeMoney(input.currentBalance, "Current Balance")
        : null;

      if (!ownerName) {
        ctx.sendError(res, 400, "Owner name is required");
        return true;
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        ctx.sendError(res, 400, "Amount must be greater than 0");
        return true;
      }

      const owners = await ctx.readOwners();
      const ownerIndex = owners.findIndex((owner) => ctx.ownerNameMatches(owner.name, ownerName));
      if (ownerIndex === -1) {
        ctx.sendError(res, 400, "Owner not found in Owner Master");
        return true;
      }

      const existingBalance = await ctx.resolveOwnerAdvanceBaselineBalance(ownerName, owners[ownerIndex]);
      const nextBalance = hasCurrentBalanceInput
        ? currentBalanceInput
        : Number((existingBalance + amount).toFixed(2));
      owners[ownerIndex] = {
        ...owners[ownerIndex],
        currentBalance: String(nextBalance.toFixed(2))
      };
      await ctx.writeOwners(owners);

      const ownerAdvances = await ctx.readOwnerAdvances();
      const ownerAdvance = {
        ownerAdvanceId: ctx.allocateOwnerAdvanceId(ownerAdvances),
        date,
        ownerName,
        amount: String(amount),
        paymentMode,
        currentBalance: String(nextBalance.toFixed(2)),
        notes,
        createdBy: user.name || user.username || user.email,
        createdDate: new Date().toISOString().slice(0, 10)
      };

      await ctx.appendOwnerAdvance(ownerAdvance);
      const refreshedOwner = await ctx.refreshOwnerCurrentBalance(ownerName);
      ownerAdvance.currentBalance = refreshedOwner.currentBalance || ownerAdvance.currentBalance;
      ctx.send(res, 201, { ownerAdvance });
      return true;
    }
  }

  const ownerAdvanceMatch = pathname.match(/^\/api\/owner-advances\/([^/]+)$/);
  if (ownerAdvanceMatch && req.method === "PATCH") {
    if (!ctx.requireRole(user, ["reviewer", "admin"])) {
      ctx.sendError(res, 403, "Only reviewers and admins can edit owner advances");
      return true;
    }
    const ownerAdvanceId = decodeURIComponent(ownerAdvanceMatch[1]);
    const input = await ctx.readJson(req);
    const ownerName = String(input.ownerName || "").trim();
    const amount = Number(input.amount || 0);
    const paymentMode = String(input.paymentMode || "Cash").trim();
    const notes = String(input.notes || "").trim();
    const date = String(input.date || new Date().toISOString().slice(0, 10)).trim();
    const hasCurrentBalanceInput = input.currentBalance != null && String(input.currentBalance).trim() !== "";
    const currentBalanceInput = hasCurrentBalanceInput
      ? ctx.parseNonNegativeMoney(input.currentBalance, "Current Balance")
      : null;

    if (!ownerName) {
      ctx.sendError(res, 400, "Owner name is required");
      return true;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      ctx.sendError(res, 400, "Amount must be greater than 0");
      return true;
    }

    const ownerAdvances = await ctx.readOwnerAdvances();
    const index = ownerAdvances.findIndex((entry) => entry.ownerAdvanceId === ownerAdvanceId);
    if (index === -1) {
      ctx.sendError(res, 404, "Owner advance not found");
      return true;
    }

    const previousOwnerName = String(ownerAdvances[index].ownerName || "").trim();

    let nextBalance = ownerAdvances[index].currentBalance || "";
    if (hasCurrentBalanceInput) {
      const ownerRecord = await ctx.setOwnerCurrentBalance(ownerName, currentBalanceInput);
      nextBalance = ownerRecord.currentBalance || String(currentBalanceInput.toFixed(2));
    }

    const updated = {
      ...ownerAdvances[index],
      ownerName,
      amount: String(amount),
      paymentMode,
      notes,
      date,
      currentBalance: nextBalance
    };
    ownerAdvances[index] = updated;
    await ctx.writeOwnerAdvances(ownerAdvances);
    const ownerNamesToRefresh = Array.from(new Set([previousOwnerName, ownerName].filter(Boolean)));
    for (const targetOwnerName of ownerNamesToRefresh) {
      const refreshedOwner = await ctx.refreshOwnerCurrentBalance(targetOwnerName);
      if (ctx.ownerNameMatches(targetOwnerName, ownerName)) {
        updated.currentBalance = refreshedOwner.currentBalance || updated.currentBalance;
      }
    }
    ctx.send(res, 200, { ownerAdvance: updated });
    return true;
  }

  return false;
}

module.exports = {
  handleRoutes
};
