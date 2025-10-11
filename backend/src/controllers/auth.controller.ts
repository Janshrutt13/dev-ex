import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import  User  from "../models/user.model";
import { validationResult } from "express-validator";

const generateToken = (id : String) => {
    if (!process.env.JWT_SECRET_KEY) {
        throw new Error("JWT_SECRET not configured");
    }
    return jwt.sign({id} , process.env.JWT_SECRET_KEY,
        {expiresIn : "30d"}
    );
}

export const signup = async(req : any,res : any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors : errors.array()});
    }

    const { username , email , password } = req.body;

    if(!username || !email || !password) {
        return res.status(400).json({message : "All fields are required"});
    }

    try{
  
        const userExists = await User.findOne({ email })
        if(userExists) {
            return res.status(400).json({message : "User already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password , salt);

        const user = await User.create({
            username,
            email,
            password : passwordHash
        });

        if(user) {
            res.status(201).json({
                _id : user.id,
                username : user.username,
                email : user.email,
                token : generateToken(user.id)
            });
        } else{
            return res.status(400).json({ message : "Invalid user data"});
        }

    }catch(err){
        console.log(err);
        return res.status(500).json({ message : "Internal server error"});
    }
}

export const login = async( req : any , res : any) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors : errors.array()});
    }

    const { email , password } = req.body;

    try{

        const user = await User.findOne({ email });

        if(!user) {
            return res.status(401).json({ message : "No such user exists"});
        }
        if(user && (await bcrypt.compare(password, user.password))){
            res.json({
                _id : user.id,
                username : user.username,
                email : user.email,
                token : generateToken(user.id)
            });
        }else{
            res.status(400).json({ message : "Invalid credentials"});
        }
    }catch(err){
        console.log(err);
        return res.status(500).json({ message : "Internal server error"});
    }
}

