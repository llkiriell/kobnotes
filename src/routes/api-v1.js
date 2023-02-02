
const express = require("express");
const router = express.Router();
const configController = require("../controllers/configurationController");

//Middleware bodyparse => json
router.use(express.json());

router.get('/settings',configController.fetch);
router.post('/settings',configController.create);
router.put('/settings',configController.update);
router.delete('/settings',configController.delete);

module.exports = router;