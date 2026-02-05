const bookingService = require("../services/bookingService");
const mongoose = require("mongoose");

exports.createBooking = async (req, res) => {
  try {
    const booking = await bookingService.createBooking({
      userId: req.userId,
      ...req.body
    });
    res.status(201).json(booking);
  } catch (e) {
    if (e.message === "BOOKING_CONFLICT")
      return res.status(409).json({ message: "Booking conflict" });
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


exports.getBookingDetail = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid booking id" });
  }

  const booking = await bookingService.getBookingById(id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  res.json(booking);
};

exports.getUserBookings = async (req, res) => {
  const bookings = await bookingService.getBookingsOfUser(req.params.id);
  res.json(bookings);
};

exports.getOwnerBookings = async (req, res) => {
  const bookings = await bookingService.getOwnerBookings(req.userId);
  res.json(bookings);
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await require("../models/Booking")
      .find()
      .populate("userId", "name email")
      .populate("carId", "brand model pricePerDay");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};