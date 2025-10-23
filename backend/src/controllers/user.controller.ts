import User from '../models/user.model';
const { CalculateStreak, calculateLongestStreak } = require('../utils/streak.utils');
const Log = require('../models/logs.model');
import Collab from '../models/collab.models';

/**
 * @desc    Get current logged-in user's profile
 * @route   GET /api/users/me
 * @access  Private
 */

const getMe = async (req : any,res : any) => {
   try{
     
    const user = await User.findById(req.user.id)
   .select('-passwordHash'); //Exclude password

   if(!user){
     return res.status(400).json({ message : 'User not found!'})
   }

   const currentStreak = CalculateStreak(user.streak) || 0;
   const longestStreak = calculateLongestStreak(user.streak) || 0; 

   const userObject = user.toObject();

   res.json({
    ...userObject,
    currentStreak,
    longestStreak
   });

   }catch(err){
     console.error(err);
     return res.status(500).json({
        message : 'Server Error'
     });
   }
}

/**
 * @desc    Get user profile data by username
 * @route   GET /api/users/:username
 * @access  Public
 */

const getUserProfile = async (req : any, res : any) => {
   try{
     
      const user = await User.findOne({ username : req.params.username}).select('-passwordHash');
      if(!user){
        return res.status(404).json({ message : `User not found`});
      }
      res.json(user);
   }catch(err){
     console.error(err);
     res.status(500).json({ message : 'Server Error'});
   }
};

/**
 * @desc    Get all logs posted by a specific user
 * @route   GET /api/users/:username/logs
 * @access  Public
 */

const getUserLogs = async(req : any , res : any) => {
  
  try{

    const user = await User.findOne({ username : req.params.username});
    if(!user){
      return res.status(404).json({ message : 'User not found'});
    }

    const logs = await Log.find({ author : user._id})
    .populate('author' , 'username profileImageUrl')
    .sort({ createdAt : -1});

    res.json(logs);

  }catch(err){
    console.error(err);
    return res.status(500).json({ message : 'Server Error'});
  }

};

const getUserCollabs = async(req : any, res : any) => {

  try{

     const user = await User.findOne({ username : req.params.username});
     if(!user){
       return res.status(404).json({ message : 'User not found'});
     }

     //Find collabs they posted
     const created = await Collab.find({ author : user._id})
     .populate('author' , 'username profileImageUrl')
     .sort({createdAt : -1});

     //Find collabs they joined
     const joined = await Collab.find({ collaborators : user._id})
     .populate('author', 'username profileImageUrl')
     .sort({createdAt : -1});

     res.json({ created , joined});

  }catch(err){
     console.error(err);
     return res.status(500).json({ message : 'Server Error'});
  }
};

export { getMe, getUserCollabs , getUserLogs , getUserProfile };