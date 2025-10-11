import express from "express"
const { signup, login } = require("../controllers/auth.controller");
import { body } from "express-validator"
const router = express.Router();

router.post("/signup" , [
    body("username" , 'Username is not required').not().isEmpty(),
    body("email", 'Please include a valid email').isEmail(),
    body("password" , 'Password must be 6 or more character').isLength({min : 6})
],signup
);

router.post("/login", [
    body("email", 'Please include a valid email').isEmail(),
    body("password" , 'Password is Required').exists()
],login
);

module.exports = router;