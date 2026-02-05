const Booking = require("../models/Booking");

exports.getBookingSummary = async () => {
  const total = await Booking.countDocuments();

  const byStatus = await Booking.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  return { total, byStatus };
};
