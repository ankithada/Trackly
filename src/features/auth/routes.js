async function handleRoutes(req, res, user, pathname, ctx) {
  if (pathname === "/api/config/status") {
    if (req.method !== "GET") return false;
    ctx.send(res, 200, {
      googleConnected: ctx.google.enabled,
      demoMode: !ctx.google.enabled,
      site: ctx.SITE,
      deployment: {
        service: ctx.DEPLOYMENT_SERVICE,
        revision: ctx.DEPLOYMENT_REVISION
      },
      credentialsSource: ctx.google.credentialsSource,
      runtimeDiagnostics: ctx.google.runtimeDiagnostics(),
      sheetId: ctx.google.sheetId || null,
      driveFolderId: ctx.google.driveFolderId || null
    });
    return true;
  }

  if (pathname === "/api/config/health") {
    if (req.method !== "GET") return false;
    const health = await ctx.google.healthCheck();
    ctx.send(res, 200, health);
    return true;
  }

  if (pathname === "/api/auth/me") {
    if (req.method !== "GET") return false;
    ctx.send(res, 200, { user });
    return true;
  }

  if (pathname === "/api/auth/logout") {
    if (req.method !== "POST") return false;
    ctx.send(res, 200, { ok: true }, { "Set-Cookie": ctx.clearSessionCookieHeader() });
    return true;
  }

  if (pathname === "/api/auth/login") {
    if (req.method !== "POST") return false;
    const { email, username, password } = await ctx.readJson(req);
    let users = await ctx.readUsers();
    if (ctx.google.enabled && users.length === 0) {
      const defaultUsername = (process.env.ADMIN_EMAIL || "admin").split("@")[0];
      const admin = ctx.seededUser("Admin", defaultUsername, process.env.ADMIN_PASSWORD || "admin123", "admin");
      await ctx.appendUser(admin);
      users = [admin];
    }

    const identifier = String(username || email || "").trim().toLowerCase();
    const identifierCandidates = Array.from(new Set([
      identifier,
      identifier.includes("@") ? identifier.split("@")[0] : ""
    ].filter(Boolean)));

    const found = users.find((item) => {
      const usernameValue = String(item.username || "").trim().toLowerCase();
      const emailValue = String(item.email || "").trim().toLowerCase();
      const matchesIdentifier = identifierCandidates.includes(usernameValue) || identifierCandidates.includes(emailValue);
      return matchesIdentifier && ctx.verifyPassword(password, item.password) && item.active !== "false";
    });

    if (!found) {
      ctx.sendError(res, 401, "Invalid email or password");
      return true;
    }

    if (ctx.needsPasswordMigration(users)) {
      users = await ctx.migratePlaintextPasswords(users);
    }

    const safeUser = { id: found.id, name: found.name, username: found.username, email: found.email, role: found.role };
    ctx.send(res, 200, { user: safeUser }, { "Set-Cookie": ctx.serializeSessionCookie(ctx.makeSession(safeUser), 36000) });
    return true;
  }

  return false;
}

module.exports = {
  handleRoutes
};
