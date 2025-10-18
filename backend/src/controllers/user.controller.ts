export{};

const User = require('../models/user.model');

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

   res.json(user);

   }catch(err){
     console.error(err);
     return res.status(500).json({
        message : 'Server Error'
     });
   }
}

module.exports = {getMe};