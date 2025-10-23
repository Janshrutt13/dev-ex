export{};

const express = require('express');
const router = express.Router();
const { getMe, getUserCollabs , getUserLogs , getUserProfile } = require('../controllers/user.controller');
const {protect} = require('../middleware/auth.middleware');

router.get('/me', protect, getMe);
router.get('/:username', getUserProfile);
router.get('/:username/logs', getUserLogs);
router.get('/:username/collabs' , getUserCollabs);

module.exports = router;