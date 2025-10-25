import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { createCollabProject, deleteCollab, getAllCollabMessages, getAllCollabProjects, joinCollabProject 
    , manageRequests, removeCollaborator
 } from '../controllers/collab.controller';

const router = express.Router();

router.get("/", getAllCollabProjects);

router.post("/" , protect , createCollabProject);

//Join a project -> protected
router.patch("/:id/join" , protect , joinCollabProject);

router.delete("/:id" , protect , deleteCollab);

router.get("/:id/messages" , protect , getAllCollabMessages);

router.patch("/:id/manage" , protect , manageRequests);

router.patch("/:id/remove" , protect , removeCollaborator);

export default router