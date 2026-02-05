const router = require("express").Router();
const authCtrl = require("../controllers/authController");

router.get("/login", authCtrl.loginPage);
router.post("/login", authCtrl.login);
router.get("/register", authCtrl.registerPage);
router.post("/register", authCtrl.register);
router.get("/logout", authCtrl.logout);

module.exports = router;
