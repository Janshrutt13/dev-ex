const Log = require("../models/logs.model");
const User = require("../models/user.model");

const IsSameDay = (date1 : any ,date2 : any) => {
  return date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate();
}

/**
 * @desc    Create a new log post
 * @route   POST /api/logs
 * @access  Private
 */

const createLog = async(req : any,res : any) => {
   
   try{
     
    const {content , tags } = req.body
    const { authorId } = req.user.id //From Middleware

    if(!content || !tags){
        return res.status(400).json({message : "Please fill all the fields"})   
    }

    const newLog = await Log.create({
        author : authorId,
        content,
        tags : tags || []
    });

    //Update user streak
    const user = await User.findById({authorId});
    const LastLog = user?.streak && user.streak.length > 0 ? user.streak[user.streak.length - 1] : null;    
    const today = new Date();

    if(!LastLog || !IsSameDay(LastLog,today)){
        user?.streak.push(today);
        await user?.save();
    }

    const populatedLog = await newLog.populate('author' , 'username profileImageUrl');
    res.status(201).json(populatedLog);
   }catch(err){
      console.error(err)
      return res.status(500).json({ message : "Internal Server Error"});
   }
}

const getLogs = async(req : any , res : any) => {
    
    try{

        const Logs = await Log.find()
        .populate('author' , 'username profileImageUrl')
        .sort({ createdAt : -1 }) // get latest logs
        .limit(50);
          
        return res.status(200).json(Logs);
    }catch(err){
        console.error(err)
        return res.status(500).json({ message : "Interal Server Error"});
    }

}

module.exports = { createLog , getLogs };