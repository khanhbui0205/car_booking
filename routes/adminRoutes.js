const router = require("express").Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const adminController = require("../controllers/adminController");

router.get("/bookings/summary", auth, authorize("admin"), adminController.getBookingSummary);

module.exports = router;
