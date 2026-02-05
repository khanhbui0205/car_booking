const ownerService = require("../services/ownerService");

exports.getOwnerBookings = async (req, res) => {
  const bookings = await ownerService.getOwnerBookings(req.userId);
  res.json(bookings);
};
