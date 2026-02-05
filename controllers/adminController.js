const adminService = require("../services/adminService");

exports.getBookingSummary = async (req, res) => {
  const summary = await adminService.getBookingSummary();
  res.json(summary);
};
