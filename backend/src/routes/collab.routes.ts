import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { createCollabProject, deleteCollab, getAllCollabProjects, joinCollabProject } from '../controllers/collab.controller';

const router = express.Router();

router.get("/", getAllCollabProjects);

router.post("/" , protect , createCollabProject);

//Join a project -> protected
router.patch("/:id/join" , protect , joinCollabProject);

router.delete("/:id" , protect , deleteCollab);

export default router;