const router = require("express").Router();
const ctrl = require("../controllers/carController");

router.get("/", ctrl.getCars);
router.post("/", ctrl.createCar);

module.exports = router;
