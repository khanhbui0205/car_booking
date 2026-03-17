const router = require("express").Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const ctrl = require("../controllers/bookingController");

router.get("/", auth, authorize("admin"), ctrl.getAllBookings);
router.get("/history", auth, ctrl.getBookingHistory);
router.get("/users/:id/bookings", auth, ctrl.getUserBookings);
router.get("/own_bookings", auth, authorize("owner"), ctrl.getOwnerBookings);
router.post("/", auth, authorize("customer"), ctrl.createBooking);
router.put("/:id/confirm", auth, authorize("admin"), ctrl.confirmBooking);
router.patch("/:id/cancel", auth, ctrl.cancelBooking);
router.get("/:id", auth, ctrl.getBookingDetail);

module.exports = router;
