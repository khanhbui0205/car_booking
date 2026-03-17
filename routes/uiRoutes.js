const router = require("express").Router();
const Car = require("../models/Car");
const User = require("../models/User");
const Booking = require("../models/Booking");
const { normalizeRole, ROLE_ADMIN, ROLE_CUSTOMER } = require("../utils/roles");

const getCurrentUser = (req) => {
  if (!req.session || !req.session.user) {
    return null;
  }

  req.session.user.role = normalizeRole(req.session.user.role);
  return req.session.user;
};

const canAccessBooking = (user, booking) => {
  if (user.role === ROLE_ADMIN) {
    return true;
  }

  if (user.role === ROLE_CUSTOMER) {
    return String(booking.userId._id || booking.userId) === String(user.id);
  }

  return false;
};

// Dashboard
router.get("/", async (req, res) => {
  res.render("dashboard", { user: getCurrentUser(req) });
});

// Cars
router.get("/cars", async (req, res) => {
  try {
    const user = getCurrentUser(req);
    let filter = {};

    if (user.role !== ROLE_ADMIN) {
      // Customers see all approved cars
      filter = { approvalStatus: "APPROVED" };
    }

    let cars = await Car.find(filter).sort({ createdAt: -1 });

    // Fallback: If no approved cars found for customer, try to show all cars
    if (cars.length === 0 && user.role !== ROLE_ADMIN) {
      cars = await Car.find({}).sort({ createdAt: -1 });
    }

    res.render("cars/list", { cars, user });
  } catch (error) {
    console.error("Error loading cars:", error);
    return res.render("cars/list", { cars: [], user: getCurrentUser(req), error: error.message });
  }
});

router.get("/cars/create", (req, res) => {
  const user = getCurrentUser(req);
  if (user.role !== ROLE_ADMIN) {
    return res.status(403).redirect("/dashboard");
  }

  res.render("cars/create", { user });
});

router.get("/cars/:id", async (req, res) => {
  try {
    const user = getCurrentUser(req);
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).send("Car not found");
    }

    const canViewCar =
      user.role === ROLE_ADMIN ||
      (user.role === ROLE_CUSTOMER && car.approvalStatus === "APPROVED");

    if (!canViewCar) {
      return res.status(403).redirect("/ui/cars");
    }

    const relatedCars = await Car.find({
      _id: { $ne: req.params.id },
      approvalStatus: "APPROVED"
    }).limit(3);

    res.render("cars/detail", { car, relatedCars, user });
  } catch (error) {
    console.error("Error loading car detail:", error);
    return res.status(500).send("Error loading car");
  }
});

// Bookings
router.get("/bookings", async (req, res) => {
  try {
    const user = getCurrentUser(req);
    let filter = {};

    if (user.role !== ROLE_ADMIN) {
      filter = { userId: user.id };
    }

    const bookings = await Booking.find(filter)
      .populate("userId", "name email")
      .populate("carId", "brand model pricePerDay ownerId")
      .sort({ createdAt: -1 });

    res.render("bookings/list", { bookings, user });
  } catch (error) {
    console.error("Error loading bookings:", error);
    return res.render("bookings/list", { bookings: [], user: getCurrentUser(req), error: error.message });
  }
});

router.get("/bookings/create", (req, res) => {
  const user = getCurrentUser(req);
  if (user.role !== ROLE_CUSTOMER) {
    return res.status(403).redirect("/ui/bookings");
  }

  res.render("bookings/create", { user });
});

router.get("/bookings/:id", async (req, res) => {
  const user = getCurrentUser(req);
  const booking = await Booking.findById(req.params.id)
    .populate("userId")
    .populate("carId");

  if (!booking) {
    return res.status(404).send("Booking not found");
  }

  if (!canAccessBooking(user, booking)) {
    return res.status(403).redirect("/ui/bookings");
  }

  res.render("bookings/detail", { booking, user });
});

// Users (Admin only)
router.get("/users", async (req, res) => {
  const user = getCurrentUser(req);

  if (user.role !== ROLE_ADMIN) {
    return res.status(403).redirect("/dashboard");
  }

  const users = await User.find();
  res.render("users/list", { users, user });
});

module.exports = router;
