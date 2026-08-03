async function handleRoutes(req, res, user, pathname, ctx) {
  if (pathname === "/api/users") {
    if (req.method === "GET") {
      if (!ctx.requireRole(user, ["admin", "reviewer"])) {
        ctx.sendError(res, 403, "Only admins and reviewers can manage users");
        return true;
      }
      const users = (await ctx.readUsers()).map(({ password, ...item }) => item);
      ctx.send(res, 200, { users });
      return true;
    }

    if (req.method === "POST") {
      if (!ctx.requireRole(user, ["admin", "reviewer"])) {
        ctx.sendError(res, 403, "Only admins and reviewers can manage users");
        return true;
      }
      const input = await ctx.readJson(req);
      const username = String(input.username || input.email || "").trim();
      const fullName = String(input.name || input.fullName || username).trim();
      const rawPassword = input.password || ctx.crypto.randomBytes(6).toString("hex");
      const newUser = {
        id: ctx.crypto.createHash("sha1").update(username).digest("hex").slice(0, 12),
        name: fullName,
        username,
        email: username,
        password: ctx.hashPassword(rawPassword),
        role: input.role || "staff",
        active: String(input.active || "true"),
        createdAt: new Date().toISOString()
      };
      await ctx.appendUser(newUser);
      ctx.send(res, 201, { user: { ...newUser, password: undefined }, temporaryPassword: rawPassword });
      return true;
    }
  }

  const userMatch = pathname.match(/^\/api\/users\/([^/]+)$/);
  if (userMatch && req.method === "PATCH") {
    if (!ctx.requireRole(user, ["admin", "reviewer"])) {
      ctx.sendError(res, 403, "Only admins and reviewers can manage users");
      return true;
    }
    const users = await ctx.readUsers();
    const index = users.findIndex((item) => item.id === userMatch[1]);
    if (index === -1) {
      ctx.sendError(res, 404, "User not found");
      return true;
    }
    const input = await ctx.readJson(req);
    users[index] = {
      ...users[index],
      name: input.name ?? users[index].name,
      username: input.username ?? users[index].username,
      email: input.username ?? users[index].email,
      role: input.role ?? users[index].role,
      active: input.active ?? users[index].active
    };
    await ctx.writeUsers(users);
    const { password: _password, ...safeUser } = users[index];
    ctx.send(res, 200, { user: safeUser });
    return true;
  }

  const userResetMatch = pathname.match(/^\/api\/users\/([^/]+)\/reset-password$/);
  if (userResetMatch && req.method === "POST") {
    if (!ctx.requireRole(user, ["admin", "reviewer"])) {
      ctx.sendError(res, 403, "Only admins and reviewers can manage users");
      return true;
    }
    const users = await ctx.readUsers();
    const index = users.findIndex((item) => item.id === userResetMatch[1]);
    if (index === -1) {
      ctx.sendError(res, 404, "User not found");
      return true;
    }
    const input = await ctx.readJson(req);
    const rawPassword = String(input.password || ctx.crypto.randomBytes(6).toString("hex"));
    if (!rawPassword.trim()) {
      ctx.sendError(res, 400, "Password is required");
      return true;
    }
    users[index] = {
      ...users[index],
      password: ctx.hashPassword(rawPassword)
    };
    await ctx.writeUsers(users);
    const { password: _password, ...safeUser } = users[index];
    ctx.send(res, 200, { user: safeUser, temporaryPassword: rawPassword });
    return true;
  }

  return false;
}

module.exports = {
  handleRoutes
};
