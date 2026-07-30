async function handleRoutes(req, res, user, pathname, ctx) {
  if (pathname === "/api/fleet") {
    if (req.method === "GET") {
      ctx.send(res, 200, { fleetDetails: await ctx.readFleetDetails() });
      return true;
    }

    if (req.method === "POST") {
      if (!ctx.requireRole(user, ["admin", "reviewer"])) {
        ctx.sendError(res, 403, "Only admins and reviewers can manage fleet details");
        return true;
      }

      const input = await ctx.readJson(req);
      const fleetDetails = await ctx.readFleetDetails();
      const ownerName = String(input.ownerName || "").trim();
      const vehicleNumber = String(input.vehicleNumber || "").trim().toUpperCase();
      if (!ownerName) {
        ctx.sendError(res, 400, "Owner name is required");
        return true;
      }
      if (!vehicleNumber) {
        ctx.sendError(res, 400, "Vehicle number is required");
        return true;
      }
      const duplicate = fleetDetails.find((fleet) => ctx.normalizeCell(fleet.vehicleNumber).toUpperCase() === vehicleNumber);
      if (duplicate) {
        ctx.sendError(res, 400, "Vehicle number already exists in fleet details");
        return true;
      }
      const fleet = {
        fleetId: ctx.allocateFleetId(fleetDetails),
        ownerName,
        vehicleNumber,
        vehicleCategory: String(input.vehicleCategory || "").trim(),
        vehicleType: String(input.vehicleType || "").trim(),
        status: String(input.status || "Active").trim(),
        notes: String(input.notes || "").trim()
      };
      fleetDetails.push(fleet);
      await ctx.writeFleetDetails(fleetDetails);
      ctx.send(res, 201, { fleet });
      return true;
    }
  }

  const fleetMatch = pathname.match(/^\/api\/fleet\/([^/]+)$/);
  if (fleetMatch && req.method === "PATCH") {
    if (!ctx.requireRole(user, ["admin", "reviewer"])) {
      ctx.sendError(res, 403, "Only admins and reviewers can manage fleet details");
      return true;
    }

    const fleetDetails = await ctx.readFleetDetails();
    const index = fleetDetails.findIndex((fleet) => fleet.fleetId === fleetMatch[1]);
    if (index === -1) {
      ctx.sendError(res, 404, "Fleet record not found");
      return true;
    }
    const input = await ctx.readJson(req);
    const nextVehicleNumber = String(input.vehicleNumber ?? fleetDetails[index].vehicleNumber).trim().toUpperCase();
    if (!String(input.ownerName ?? fleetDetails[index].ownerName).trim()) {
      ctx.sendError(res, 400, "Owner name is required");
      return true;
    }
    if (!nextVehicleNumber) {
      ctx.sendError(res, 400, "Vehicle number is required");
      return true;
    }
    const duplicate = fleetDetails.find((fleet, fleetIndex) => fleetIndex !== index && ctx.normalizeCell(fleet.vehicleNumber).toUpperCase() === nextVehicleNumber);
    if (duplicate) {
      ctx.sendError(res, 400, "Another fleet record already uses this vehicle number");
      return true;
    }
    fleetDetails[index] = {
      ...fleetDetails[index],
      ownerName: String(input.ownerName ?? fleetDetails[index].ownerName).trim(),
      vehicleNumber: nextVehicleNumber,
      vehicleCategory: String(input.vehicleCategory ?? fleetDetails[index].vehicleCategory).trim(),
      vehicleType: String(input.vehicleType ?? fleetDetails[index].vehicleType).trim(),
      status: String(input.status ?? fleetDetails[index].status).trim(),
      notes: String(input.notes ?? fleetDetails[index].notes).trim()
    };
    await ctx.writeFleetDetails(fleetDetails);
    ctx.send(res, 200, { fleet: fleetDetails[index] });
    return true;
  }

  return false;
}

module.exports = {
  handleRoutes
};
