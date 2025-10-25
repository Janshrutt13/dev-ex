import CollabProject from '../models/collab.models';
import User from '../models/user.model';
const Message = require('../models/message.models');


//Helper function to repopulate a project with necessary fields
const populateProject = (project : any) => {
  return project.populate([
    { path: 'author', select: 'username profileImageUrl' },
    { path: 'collaborators', select: 'username profileImageUrl' },
    { path: 'pendingRequests', select: 'username profileImageUrl' }
  ]);
};

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
        .populate('pendingRequests' , 'username profileImageUrl')
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
       if(project.collaborators.some((collab: any) => collab.toString() === userId)){
         return res.status(400).json({ message : "You are already a collaborator"});
       }

       if(project.pendingRequests.some(p => p.toString() === userId)){
          return res.status(400).json({ message : "You have already requested to join this project"});
       }

       //Add user to pending requests
       project.pendingRequests.push(userId);
       await project.save();

       const updatedProject = await populateProject(project)

       res.status(200).json(updatedProject);
       
    }catch(err){
        console.error(err);
        return res.status(500).json({ message : "Internal Server Error"});
    }
}

const manageRequests = async(req : any , res : any) => {
   try{
   
      const {applicantId , action} = req.body;
      const project =  await CollabProject.findById(req.params.id);

      if(!project?.author.equals(req.user.id)){
        return res.status(401).json({ message : "Unauthorized"});
      }

      project.pendingRequests = project.pendingRequests.filter((id: any) => id.toString() !== applicantId);

      if(action === 'accept'){
         if(!project.collaborators.includes(applicantId)){
           project.collaborators.push(applicantId);
         }
      }

      await project.save();
      const updatedProject = populateProject(project);
      res.status(200).json(updatedProject);

   }catch(err){
      console.error(err);
      return res.status(500).json({ message : "Internal Server Error!"});
   }
};

const removeCollaborator = async(req : any , res : any) => {
  try{

    const {memberId} = req.body;
    const project = await CollabProject.findById(req.params.id);

    if(!project?.author.equals(req.user.id)){
      return res.status(401).json({ message : "Not Authorized"});
    }

    project.collaborators = project.collaborators.filter((id: any) => id.toString() !== memberId);
    await project.save();

    const updatedProject = await populateProject(project);
    res.status(200).json(updatedProject);

  }catch(err){
    console.error(err);
    return res.status(500).json({ message : "Internal Server Error!"});
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

const getAllCollabMessages = async(req : any , res : any) => {
     try{

      const project = await CollabProject.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const userId = req.user.id;
      const isMember = project.author.toString() === userId || project.collaborators.some((c: any) => c.toString() === userId);

      if (!isMember) {
        return res.status(401).json({ message: 'You are not a member of this project' });
      }

      const messages = await Message.find({
         collabRoom : req.params.id
      })
      .sort({ createdAt : 'asc'});

      res.status(200).json(messages);

     }catch(err){
        console.error(err);
        res.status(500).json({ message : "Internal Server Error!"});
     }
}



export {
    createCollabProject,
    getAllCollabProjects,
    joinCollabProject,
    deleteCollab,
    getAllCollabMessages,
    manageRequests,
    removeCollaborator
};