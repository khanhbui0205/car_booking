const { normalizeRole } = require("../utils/roles");

const flattenRoles = (roles) =>
  roles.flatMap((role) => (Array.isArray(role) ? role : [role])).map(normalizeRole);

module.exports = (...roles) => {
  const allowedRoles = flattenRoles(roles);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = normalizeRole(req.user.role);
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};
