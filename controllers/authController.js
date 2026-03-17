const User = require("../models/User");
const { hashPassword, isHashedPassword, verifyPassword } = require("../utils/password");
const { createAuthToken } = require("../utils/token");
const {
  normalizeRole,
  ROLE_ADMIN,
  ROLE_CUSTOMER
} = require("../utils/roles");

const isJsonRequest = (req) =>
  req.is("application/json") || (req.headers.accept || "").includes("application/json");

const toAuthResponseUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: normalizeRole(user.role)
});

const resolveRegisterRole = (requestedRole, requesterRole) => {
  const normalizedRequestedRole = normalizeRole(requestedRole);
  const normalizedRequesterRole = normalizeRole(requesterRole);

  if (normalizedRequestedRole === ROLE_ADMIN && normalizedRequesterRole !== ROLE_ADMIN) {
    return ROLE_CUSTOMER;
  }

  return ROLE_CUSTOMER;
};

const respondAuthError = (req, res, viewPath, message, statusCode = 400) => {
  if (isJsonRequest(req)) {
    return res.status(statusCode).json({ message });
  }

  return res.status(statusCode).render(viewPath, { error: message, success: null });
};

exports.loginPage = (req, res) => {
  res.render("auth/login", { error: null, success: null });
};

exports.registerPage = (req, res) => {
  res.render("auth/register", { error: null, success: null });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return respondAuthError(req, res, "auth/login", "Email and password are required", 400);
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user || !verifyPassword(password, user.password)) {
      return respondAuthError(req, res, "auth/login", "Invalid email or password", 401);
    }

    const normalizedRole = normalizeRole(user.role);
    if (!isHashedPassword(user.password) || user.role !== normalizedRole) {
      user.password = hashPassword(password);
      user.role = normalizedRole;
      await user.save();
    }

    const token = createAuthToken(user);
    req.session.user = {
      ...toAuthResponseUser(user),
      token
    };

    if (isJsonRequest(req)) {
      return res.json({
        message: "Login successful",
        token,
        user: toAuthResponseUser(user)
      });
    }

    return res.redirect("/dashboard");
  } catch (error) {
    return respondAuthError(req, res, "auth/login", "Login failed. Please try again.", 500);
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return respondAuthError(req, res, "auth/register", "All fields are required", 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return respondAuthError(req, res, "auth/register", "Email already registered", 409);
    }

    const safeRole = resolveRegisterRole(role, req.session?.user?.role);
    const newUser = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashPassword(password),
      role: safeRole
    });

    if (isJsonRequest(req)) {
      const token = createAuthToken(newUser);
      return res.status(201).json({
        message: "Account created successfully",
        token,
        user: toAuthResponseUser(newUser)
      });
    }

    return res.render("auth/register", {
      error: null,
      success: "Account created successfully! You can now login."
    });
  } catch (error) {
    return respondAuthError(req, res, "auth/register", "Registration failed. Please try again.", 500);
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      if (isJsonRequest(req)) {
        return res.status(500).json({ message: "Logout failed" });
      }
      return res.status(500).render("auth/login", { error: "Logout failed", success: null });
    }

    if (isJsonRequest(req)) {
      return res.json({ message: "Logout successful" });
    }

    return res.redirect("/auth/login");
  });
};
