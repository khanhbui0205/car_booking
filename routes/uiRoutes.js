const router = require("express").Router();
const Car = require("../models/Car");
const User = require("../models/User");
const Booking = require("../models/Booking");

router.get("/cars", async (req, res) => {
  const cars = await Car.find();
  res.render("cars/list", { cars });
});

router.get("/cars/create", (req, res) => {
  res.render("cars/create");
});

router.get("/users", async (req, res) => {
  const users = await User.find();
  res.render("users/list", { users });
});

router.get("/bookings/create", (req, res) => {
  res.render("bookings/create");
});

router.get("/bookings", async (req, res) => {
  const bookings = await Booking.find()
    .populate("userId")
    .populate("carId");

  res.render("bookings/list", { bookings });
});

router.get("/bookings/:id", async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("userId")
    .populate("carId");

  res.render("bookings/detail", { booking });
});

module.exports = router;
