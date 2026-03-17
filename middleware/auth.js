const { verifyAuthToken } = require("../utils/token");
const { normalizeRole } = require("../utils/roles");

const parseHeaderToken = (authHeader) => {
  if (!authHeader || typeof authHeader !== "string") {
    return null;
  }

  return authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : authHeader.trim();
};

module.exports = (req, res, next) => {
  const headerToken = parseHeaderToken(req.headers.authorization);
  let authenticatedUser = null;

  if (headerToken) {
    const tokenPayload = verifyAuthToken(headerToken);
    if (tokenPayload) {
      authenticatedUser = {
        id: String(tokenPayload.id),
        name: tokenPayload.name,
        email: tokenPayload.email,
        role: normalizeRole(tokenPayload.role),
        token: headerToken
      };
    }
  }

  if (!authenticatedUser && req.session && req.session.user && req.session.user.id) {
    authenticatedUser = {
      id: String(req.session.user.id),
      name: req.session.user.name,
      email: req.session.user.email,
      role: normalizeRole(req.session.user.role),
      token: req.session.user.token || null
    };
  }

  if (!authenticatedUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.session && req.session.user) {
    req.session.user.role = authenticatedUser.role;
    if (authenticatedUser.token) {
      req.session.user.token = authenticatedUser.token;
    }
  }

  req.user = authenticatedUser;
  req.userId = authenticatedUser.id;
  req.userRole = authenticatedUser.role;
  next();
};
