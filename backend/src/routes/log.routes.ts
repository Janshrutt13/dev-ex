export {}; // Make this file a module
const expressApp = require("express");
const multer = require("multer");
const router = expressApp.Router();
const { protect } = require("../middleware/auth.middleware");
const { createLog, getLogs } = require("../controllers/log.controller"); 

const upload = multer();

router.post("/" , protect, upload.any(), createLog);

router.get("/", protect , getLogs);

module.exports = router;