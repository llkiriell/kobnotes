
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
const configController = require("../controllers/configurationController");

//Middleware bodyparse => json
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(upload.single('database'));

router.get('/settings',configController.fetch);
router.post('/settings',configController.create);
router.put('/settings',configController.update);
router.delete('/settings',configController.delete);
router.post('/settings/database',configController.uploadDatabase);

module.exports = router;