async function handleRoutes(req, res, user, pathname, ctx) {
  if (pathname === "/api/owners") {
    if (req.method === "GET") {
      ctx.send(res, 200, { owners: await ctx.readOwners() });
      return true;
    }

    if (req.method === "POST") {
      if (!ctx.requireRole(user, ["admin", "reviewer"])) {
        ctx.sendError(res, 403, "Only admins can manage owners");
        return true;
      }

      const input = await ctx.readJson(req);
      const owners = await ctx.readOwners();
      const name = String(input.name || "").trim();
      const phone = String(input.phone || "").trim();
      const address = String(input.address || "").trim();
      const currentBalance = input.currentBalance == null || String(input.currentBalance).trim() === ""
        ? 0
        : ctx.parseNonNegativeMoney(input.currentBalance, "Current Balance");
      if (!name) {
        ctx.sendError(res, 400, "Owner name is required");
        return true;
      }
      const duplicate = owners.find((owner) => owner.name.toLowerCase() === name.toLowerCase());
      if (duplicate) {
        ctx.sendError(res, 400, "Owner already exists");
        return true;
      }
      const owner = { name, phone, address, currentBalance: String(currentBalance.toFixed(2)) };
      owners.push(owner);
      await ctx.writeOwners(owners);
      ctx.send(res, 201, { owner });
      return true;
    }
  }

  const ownerMatch = pathname.match(/^\/api\/owners\/(.+)$/);
  if (ownerMatch && req.method === "PATCH") {
    if (!ctx.requireRole(user, ["admin", "reviewer"])) {
      ctx.sendError(res, 403, "Only admins can manage owners");
      return true;
    }

    const owners = await ctx.readOwners();
    const currentName = decodeURIComponent(ownerMatch[1]);
    const index = owners.findIndex((owner) => owner.name === currentName);
    if (index === -1) {
      ctx.sendError(res, 404, "Owner not found");
      return true;
    }
    const input = await ctx.readJson(req);
    const nextName = String(input.name || owners[index].name).trim();
    if (!nextName) {
      ctx.sendError(res, 400, "Owner name is required");
      return true;
    }
    const parsedCurrentBalance = input.currentBalance == null || String(input.currentBalance).trim() === ""
      ? ctx.ownerCurrentBalanceValue(owners[index])
      : ctx.parseNonNegativeMoney(input.currentBalance, "Current Balance");
    const duplicate = owners.find((owner, ownerIndex) => ownerIndex !== index && owner.name.toLowerCase() === nextName.toLowerCase());
    if (duplicate) {
      ctx.sendError(res, 400, "Another owner already uses this name");
      return true;
    }

    owners[index] = {
      name: nextName,
      phone: String(input.phone ?? owners[index].phone).trim(),
      address: String(input.address ?? owners[index].address).trim(),
      currentBalance: String(parsedCurrentBalance.toFixed(2))
    };
    await ctx.writeOwners(owners);

    if (currentName !== nextName) {
      const fleetDetails = await ctx.readFleetDetails();
      let fleetChanged = false;
      const nextFleetDetails = fleetDetails.map((fleet) => {
        if (fleet.ownerName !== currentName) return fleet;
        fleetChanged = true;
        return { ...fleet, ownerName: nextName };
      });
      if (fleetChanged) await ctx.writeFleetDetails(nextFleetDetails);

      const ownerAdvances = await ctx.readOwnerAdvances();
      let ownerAdvancesChanged = false;
      const nextOwnerAdvances = ownerAdvances.map((entry) => {
        if (!ctx.ownerNameMatches(entry.ownerName, currentName)) return entry;
        ownerAdvancesChanged = true;
        return { ...entry, ownerName: nextName };
      });
      if (ownerAdvancesChanged) await ctx.writeOwnerAdvances(nextOwnerAdvances);
    }

    ctx.send(res, 200, { owner: owners[index] });
    return true;
  }

  return false;
}

module.exports = {
  handleRoutes
};
