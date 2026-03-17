require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");

const app = express();

app.use(cors());
// Body parser
app.use(express.json());

// Session configuration with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    mongoUrl: process.env.MONGO_URI,
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: { 
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// 👉 CONFIG VIEW ENGINE (PHẢI TRƯỚC ROUTES)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Connect MongoDB
connectDB();

// Auth routes (PUBLIC)
app.use("/auth", require("./routes/authRoutes"));

// Auth middleware - check if user is logged in
const checkAuth = require("./middleware/checkAuth");

// UI routes (PROTECTED)
app.use("/dashboard", checkAuth, require("./routes/uiRoutes"));
app.use("/ui", checkAuth, require("./routes/uiRoutes"));

// API routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/cars", require("./routes/carRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Home redirect
app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  res.redirect("/auth/login");
});


const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

if (NODE_ENV === "production") {
  // Production: Render handles HTTPS at load balancer
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
} else {
  // Local development: use HTTPS
  const https = require("https");
  const fs = require("fs");
  
  const sslOptions = {
    key: fs.readFileSync("./ssl/server.key"),
    cert: fs.readFileSync("./ssl/server.cert")
  };
  
  https.createServer(sslOptions, app).listen(PORT, "localhost", () => {
    console.log(`HTTPS Server running at https://localhost:${PORT}`);
  });
}