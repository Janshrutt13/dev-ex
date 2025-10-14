import { create } from "domain";

export{};

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {createCollabProject , getAllCollabProjects , joinCollabProject} = require('../controllers/collab.controller');

router.get("/" , CollabProject);

router.post("/" , protect , createCollabProject);

//Join a project -> protected
router.patch("/:id/join" , protect , joinCollabProject);

module.exports = router;