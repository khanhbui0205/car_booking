const Booking = require("../models/Booking");
const Car = require("../models/Car");
const Contract = require("../models/Contract");
const { calculateTotalPrice } = require("./priceService");

// CREATE BOOKING
exports.createBooking = async ({ userId, carId, startDate, endDate }) => {
  const conflict = await Booking.findOne({
    carId,
    startDate: { $lte: new Date(endDate) },
    endDate: { $gte: new Date(startDate) }
  });

  if (conflict) {
    throw new Error("BOOKING_CONFLICT");
  }

  const car = await Car.findById(carId);
  if (!car) {
    throw new Error("CAR_NOT_FOUND");
  }

  const totalPrice = calculateTotalPrice(startDate, endDate, car.pricePerDay);

  return Booking.create({
    userId,
    carId,
    startDate,
    endDate,
    totalPrice,
    status: "ACTIVE"
  });
};

exports.confirmBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  if (booking.status === "CONFIRMED") {
    throw new Error("BOOKING_ALREADY_CONFIRMED");
  }

  booking.status = "CONFIRMED";
  await booking.save();

  const contract = await Contract.create({
    bookingId: booking._id,
    userId: booking.userId,
    carId: booking.carId,
    startDate: booking.startDate,
    endDate: booking.endDate,
    totalPrice: booking.totalPrice
  });

  return {
    booking,
    contract
  };
};

exports.getBookingById = async (id) => {
  return Booking.findById(id)
    .populate("userId")
    .populate("carId");
};

exports.getBookingsOfUser = async (userId) => {
  return Booking.find({ userId })
    .populate("carId")
    .sort({ createdAt: -1 });
};

exports.getOwnerBookings = async (ownerId) => {
  const cars = await Car.find({ ownerId }).select("_id");

  return Booking.find({
    carId: { $in: cars.map(c => c._id) }
  })
    .populate("userId")
    .populate("carId");
};