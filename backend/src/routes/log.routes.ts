export {}; // Make this file a module
const expressApp = require("express");
const router = expressApp.Router();
const { protect } = require("../middleware/auth.middleware");
const { createLog, getLogs } = require("../controllers/log.controller"); 

router.post("/" , createLog);

router.get("/", protect , getLogs);

module.exports = router;