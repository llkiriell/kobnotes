
const express = require("express");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/data');
  },
  filename: function (req, file, cb) {
    cb(null,'KoboReader.sqlite');
  }
})
const upload = multer({ storage: storage })

const router = express.Router();
const configurationController = require("../controllers/configController");
const configController = require("../controllers/configurationController");
const notionExportController = require("../controllers/notionExportController");

//Middleware bodyparse => json
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(upload.single('database'));

router.get('/configs',configurationController.getConfigs);
router.post('/configs',configurationController.addConfig);
router.put('/configs',configurationController.updateConfig);
router.delete('/configs/:idConfig',configurationController.deleteConfig);
router.get('/configs/:idConfig',configurationController.findConfigs);

router.get('/export/notion/createPage',notionExportController.createPage);
router.get('/settings',configController.fetch);
router.post('/settings',configController.create);
router.put('/settings',configController.update);
router.delete('/settings',configController.delete);
router.post('/settings/database',configController.uploadDatabase);

module.exports = router;