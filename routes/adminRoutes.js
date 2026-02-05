const router = require("express").Router();
const auth = require("../middleware/auth");
const adminController = require("../controllers/adminController");

router.get("/bookings/summary", auth, adminController.getBookingSummary);

module.exports = router;