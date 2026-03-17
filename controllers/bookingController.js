const bookingService = require("../services/bookingService");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const { ROLE_ADMIN, ROLE_CUSTOMER, ROLE_OWNER } = require("../utils/roles");

const normalizeObjectId = (value) => String(value && value._id ? value._id : value);

const canAccessBooking = (role, userId, booking) => {
  if (role === ROLE_ADMIN) {
    return true;
  }

  if (role === ROLE_CUSTOMER) {
    return normalizeObjectId(booking.userId) === String(userId);
  }

  if (role === ROLE_OWNER) {
    const ownerId = booking.carId?.ownerId;
    return ownerId && normalizeObjectId(ownerId) === String(userId);
  }

  return false;
};

exports.createBooking = async (req, res) => {
  try {
    const booking = await bookingService.createBooking({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json(booking);
  } catch (e) {
    if (e.message === "BOOKING_CONFLICT")
      return res.status(409).json({ message: "Booking conflict" });
    if (e.message === "CAR_NOT_APPROVED")
      return res.status(400).json({ message: "Car has not been approved yet" });
    res.status(400).json({ message: e.message });
  }
};

exports.confirmBooking = async (req, res) => {
  try {
    const contract = await bookingService.confirmBooking(req.params.id);
    res.json({ message: "Booking confirmed", contract });
  } catch (e) {
    res.status(404).json({ message: e.message });
  }
};

exports.cancelBooking = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid booking id" });
  }

  const booking = await Booking.findById(id).populate("carId", "ownerId");
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (!canAccessBooking(req.user.role, req.user.id, booking)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const canceledBooking = await bookingService.cancelBooking(id);
    return res.json({ message: "Booking canceled", booking: canceledBooking });
  } catch (error) {
    if (error.message === "BOOKING_ALREADY_CANCELED") {
      return res.status(400).json({ message: "Booking already canceled" });
    }
    return res.status(500).json({ message: "Failed to cancel booking" });
  }
};


exports.getBookingDetail = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid booking id" });
  }

  const booking = await bookingService.getBookingById(id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (!canAccessBooking(req.user.role, req.user.id, booking)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  res.json(booking);
};

exports.getBookingHistory = async (req, res) => {
  if (req.user.role === ROLE_ADMIN) {
    const bookings = await Booking.find()
      .populate("userId", "name email role")
      .populate("carId", "brand model pricePerDay ownerId")
      .sort({ createdAt: -1 });
    return res.json(bookings);
  }

  if (req.user.role === ROLE_OWNER) {
    const bookings = await bookingService.getOwnerBookings(req.user.id);
    return res.json(bookings);
  }

  const bookings = await bookingService.getBookingsOfUser(req.user.id);
  return res.json(bookings);
};

exports.getOwnerBookings = async (req, res) => {
  const bookings = await bookingService.getOwnerBookings(req.user.id);
  res.json(bookings);
};

exports.getUserBookings = async (req, res) => {
  if (req.user.role !== ROLE_ADMIN && String(req.user.id) !== String(req.params.id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const bookings = await bookingService.getBookingsOfUser(req.params.id);
  return res.json(bookings);
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking
      .find()
      .populate("userId", "name email role")
      .populate("carId", "brand model pricePerDay status approvalStatus ownerId");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
