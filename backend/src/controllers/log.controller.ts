const Log = require('../models/logs.model');
import User from '../models/user.model';

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
     
    const content = req.body.content;
    const hashtags = req.body.hashtags ? JSON.parse(req.body.hashtags) : [];
    const authorId = req.user.id; //From Middleware

    if(!content){
        return res.status(400).json({message : "Content is required"})   
    }

    const newLog = await Log.create({
        author : authorId,
        content,
        tags : hashtags
    });

    //Update user streak
    const user = await User.findById(authorId);
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
        .populate('author' , 'username profileImageUrl streak')
        .sort({ createdAt : -1 }) // get latest logs
        .limit(50);
          
        return res.status(200).json(Logs);
    }catch(err){
        console.error(err)
        return res.status(500).json({ message : "Interal Server Error"});
    }

}

/**
 * @desc    Delete a log post
 * @route   DELETE /api/logs/:id
 * @access  Private
 */

const deleteLog = async(req : any , res : any) => {
    try{

       const log = await Log.findById(req.params.id);

       if(!log){
            return res.status(404).json({message : "Log not found"});
       }

       if(log.author.toString() !== req.user.id){
          return res.status(401).json({message : "Unauthorized"});
       }

       await Log.findByIdAndDelete(req.params.id);
       res.status(200).json({message : "Log deleted successfully"});

    }catch(err){
       console.error(err);
       return res.status(500).json({message : "Internal Server Error"});
    }
}

const toggleLike = async(req : any , res : any) => {
   try{

       const log = await Log.findById(req.params.id);
       
       if(!log){
         return res.status(401).json({ message : "Log not found"});
       }

       const userId = req.user.id;
       const likedIndex = log.likes.indexOf(userId);

       if(likedIndex > -1){
          log.likes.splice(likedIndex, 1);
       }
       else{
         log.likes.push(userId);
       }

       await log.save();


       const populatedLog = await log
       .populate('author' , 'username profileImageUrl')
       .populate('likes', 'username');

       res.status(200).json(populatedLog);

   }catch(err){
      console.error(err);
      return res.status(500).json({ message : "Internal Server Error"});
   }
}

export { createLog, getLogs , deleteLog , toggleLike};