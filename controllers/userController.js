const User = require("../models/User");
const { hashPassword, verifyPassword } = require("../utils/password");
const { createAuthToken } = require("../utils/token");
const { normalizeRole, ROLE_CUSTOMER, ROLE_OWNER } = require("../utils/roles");

const toUserPayload = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: normalizeRole(user.role)
});

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existed = await User.findOne({ email: normalizedEmail });
    if (existed) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const normalizedRole = normalizeRole(role);
    const safeRole = [ROLE_CUSTOMER, ROLE_OWNER].includes(normalizedRole)
      ? normalizedRole
      : ROLE_CUSTOMER;

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashPassword(password),
      role: safeRole
    });

    const token = createAuthToken(user);
    return res.status(201).json({ message: "Register successful", token, user: toUserPayload(user) });
  } catch (error) {
    return res.status(500).json({ message: "Register failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ message: "Invalid login" });
    }

    const token = createAuthToken(user);
    return res.json({ message: "Login successful", token, user: toUserPayload(user) });
  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
};
