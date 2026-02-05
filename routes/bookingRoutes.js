const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/bookingController");

router.get("/", ctrl.getAllBookings);
router.post("/", auth, ctrl.createBooking);
router.put("/:id/confirm", auth, ctrl.confirmBooking);
router.get("/users/:id/bookings", ctrl.getUserBookings);
router.get("/own_bookings", auth, ctrl.getOwnerBookings);
router.get("/:id", auth, ctrl.getBookingDetail);

module.exports = router;
