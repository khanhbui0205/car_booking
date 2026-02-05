require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

// Body parser
app.use(express.json());

// 👉 CONFIG VIEW ENGINE (PHẢI TRƯỚC ROUTES)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Connect MongoDB
connectDB();

// API routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/cars", require("./routes/carRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// UI routes
app.use("/ui", require("./routes/uiRoutes"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
