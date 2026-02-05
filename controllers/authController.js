const User = require("../models/User");

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
      return res.render("auth/login", { error: "Email and password are required", success: null });
    }

    const user = await User.findOne({ email, password });
    
    if (!user) {
      return res.render("auth/login", { error: "Invalid email or password", success: null });
    }

    // Store user in session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.redirect("/dashboard");
  } catch (error) {
    res.render("auth/login", { error: "Login failed. Please try again.", success: null });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.render("auth/register", { error: "All fields are required", success: null });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("auth/register", { error: "Email already registered", success: null });
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      role: role || "user"
    });

    res.render("auth/register", { 
      error: null, 
      success: `Account created successfully! You can now login.` 
    });
  } catch (error) {
    res.render("auth/register", { error: "Registration failed. Please try again.", success: null });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.redirect("/auth/login");
  });
};
