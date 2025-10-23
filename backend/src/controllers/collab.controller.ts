import CollabProject from '../models/collab.models';
import User from '../models/user.model';

/**
 * @desc    Create a new collaboration project
 * @route   POST /api/collabs
 * @access  Private
 */

const createCollabProject = async( req : any , res : any) => {
    try{



       const {title , description , requiredSkills} = req.body;

       if(!title || !description || !requiredSkills){
           return res.status(400).json({
               success : false,
               message : 'Please fill all the fields'
           })
       }


       const newProject = await CollabProject.create({
          author : req.user.id,
          title,
          description,
          requiredSkills : requiredSkills || []
       });

       const populatedProject = await newProject.populate('author' , 'username profileImageUrl');
       res.status(201).json(populatedProject);

    }catch(err){
      console.error(err);
      return res.status(500).json({ message : "Internal Server Error"});
    }
}

/**
 * @desc    Get all collaboration projects
 * @route   GET /api/collabs
 * @access  Public
 */

const getAllCollabProjects = async(req : any , res : any) => {
    try{
        const collabs = await CollabProject.find({ status : 'open'})
        .populate('author', 'username profileImageUrl')
        .populate('collaborators' , 'username profileImageUrl')
        .sort({ createdAt : -1});


        res.status(201).json(collabs);

    }catch(err){
        console.error(err);
        return res.status(500).json({ message : "Internal Server Error"});
    }
}

/**
 * @desc    Join a collaboration project
 * @route   PATCH /api/collabs/:id/join
 * @access  Private
 */

const joinCollabProject = async(req : any , res : any) => {
    try{


       
       const project = await CollabProject.findById(req.params.id);
       const userId = req.user.id;

       if(!project){
         return res.status(404).json({ message : "Project not found"});
       }

       //If project is not open you cannot contribute
       if(project.status !== 'open'){
         return res.status(400).json({ message : "Project is not open for collaboration"});
       }

       //If the collaborator is already the author
       if(project.author.toString() === userId){
         return res.status(400).json({ message : "You are the author of this project"});
       }

       //Check if user is already a collaborator
       if(project.collaborators.some(userId)){
         return res.status(400).json({ message : "You are already a collaborator"});
       }

       //Add collaborator to the project
       project.collaborators.push(userId);
       await project.save();

       const updatedProject = await CollabProject.findById(project._id)
       .populate('author' , 'username profileImageUrl')
       .populate('collaborators', 'username profileImageUrl');

       res.status(200).json(updatedProject);
       
    }catch(err){
        console.error(err);
        return res.status(500).json({ message : "Internal Server Error"});
    }
}

const deleteCollab = async(req : any , res : any) => {
   try{
       
      const project = await CollabProject.findById(req.params.id);
      
      if(!project){
        return res.status(404).json({ message : "Collab post not found"});
      }

      if(project.author.toString() !== req.user.id){
        return res.status(401).json({ message : "Unauthorized User"});
      }

      await CollabProject.findByIdAndDelete(req.params.id);
      res.status(200).json({ message : "Collab post deleted successfully"});

   }catch(err){
      console.error(err);
      return res.status(500).json({ message : "Internal Server Error!"});
   }
}

export {
    createCollabProject,
    getAllCollabProjects,
    joinCollabProject,
    deleteCollab
};