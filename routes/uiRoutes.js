const router = require("express").Router();
const Car = require("../models/Car");
const User = require("../models/User");
const Booking = require("../models/Booking");

// Dashboard
router.get("/", async (req, res) => {
  res.render("dashboard", { user: req.session.user });
});

// Cars
router.get("/cars", async (req, res) => {
  const cars = await Car.find();
  res.render("cars/list", { cars, user: req.session.user });
});

router.get("/cars/create", (req, res) => {
  res.render("cars/create", { user: req.session.user });
});

router.get("/cars/:id", async (req, res) => {
  const car = await Car.findById(req.params.id);
  const relatedCars = await Car.find({ _id: { $ne: req.params.id } }).limit(3);
  res.render("cars/detail", { car, relatedCars, user: req.session.user });
});

// Bookings
router.get("/bookings", async (req, res) => {
  const bookings = await Booking.find()
    .populate("userId")
    .populate("carId");

  res.render("bookings/list", { bookings, user: req.session.user });
});

router.get("/bookings/create", (req, res) => {
  res.render("bookings/create", { user: req.session.user });
});

router.get("/bookings/:id", async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("userId")
    .populate("carId");

  res.render("bookings/detail", { booking, user: req.session.user });
});

// Users (Admin only)
router.get("/users", async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).redirect('/dashboard');
  }
  
  const users = await User.find();
  res.render("users/list", { users, user: req.session.user });
});

module.exports = router;
