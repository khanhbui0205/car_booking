const router = require("express").Router();
const ctrl = require("../controllers/carController");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");

router.get("/", ctrl.getCars);
router.get("/my", auth, authorize("owner", "admin"), ctrl.getMyCars);
router.get("/system", auth, authorize("admin"), ctrl.getSystemCars);
router.post("/", auth, authorize("owner", "admin"), ctrl.createCar);
router.put("/:id", auth, authorize("owner", "admin"), ctrl.updateCar);
router.delete("/:id", auth, authorize("owner", "admin"), ctrl.deleteCar);
router.patch("/:id/approve", auth, authorize("admin"), ctrl.approveCar);

module.exports = router;
