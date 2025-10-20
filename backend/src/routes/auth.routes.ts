import express from "express"
const { signup, login } = require("../controllers/auth.controller");
const passport = require("passport");
const jwt = require("jsonwebtoken");
import { body } from "express-validator"
const router = express.Router();

// Extend Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const generateToken = (id : any) => {
   return jwt.sign({ id } , process.env.JWT_SECRET_KEY , {expiresIn : '30d'});
}

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

router.get("/github" , passport.authenticate('github' , { scope : ['user : email'] , session : false}))

router.get("/github/callback",
    passport.authenticate('github' , {failureRedirect : '/login' , session : false}),
    (req,res) => {
        try {
            //Successful auth
            const token = generateToken(req.user._id);
            //Redirect to frontend with token
            res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
        } catch (error) {
            console.error('Auth callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }
    }
);

module.exports = router;