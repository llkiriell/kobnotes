
const express = require("express");
const router = express.Router();

const bookController = require("../controllers/bookController");

//Middleware bodyparse => json
router.use(express.json());

router.get('/books', bookController.getBooks);
router.get("/books/:idBook/bookmarks", bookController.getBookmarks);


module.exports = router;