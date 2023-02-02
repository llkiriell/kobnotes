
const express = require("express");
const router = express.Router();

const configurationController = require("../controllers/configurationController");

//Middleware bodyparse => json
router.use(express.json());

router.get('/', configurationController.fetch);


module.exports = router;