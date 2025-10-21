import User from '../models/user.model';
const { CalculateStreak, calculateLongestStreak } = require('../utils/streak.utils');

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

export { getMe };