export {}; // Make this file a module
const expressApp = require("express");
const multer = require("multer");
const router = expressApp.Router();
const { protect } = require("../middleware/auth.middleware");
const { createLog, getLogs , deleteLog } = require("../controllers/log.controller"); 

const upload = multer();

router.post("/" , protect, upload.any(), createLog);

router.get("/", protect , getLogs);

router.delete("/:id" , protect , deleteLog);

module.exports = router;