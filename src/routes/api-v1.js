
const express = require("express");
const router = express.Router();
const configcontroller = require("../controllers/configurationController");

//Middleware bodyparse => json
router.use(express.json());

router.get('/settings',configcontroller.fetch);
router.post('/settings',configcontroller.create);
router.put('/settings',configcontroller.update);
router.delete('/settings',configcontroller.delete);

module.exports = router;