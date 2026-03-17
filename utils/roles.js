const ROLE_CUSTOMER = "customer";
const ROLE_ADMIN = "admin";
const ROLE_LEGACY_USER = "user";

const SUPPORTED_ROLES = [ROLE_CUSTOMER, ROLE_ADMIN];

const normalizeRole = (role) => {
  if (role === ROLE_LEGACY_USER || !role) {
    return ROLE_CUSTOMER;
  }

  if (SUPPORTED_ROLES.includes(role)) {
    return role;
  }

  return ROLE_CUSTOMER;
};

module.exports = {
  ROLE_CUSTOMER,
  ROLE_ADMIN,
  ROLE_LEGACY_USER,
  SUPPORTED_ROLES,
  normalizeRole
};
