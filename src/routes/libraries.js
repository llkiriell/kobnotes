
const express = require("express");
const router = express.Router();

const bookController = require("../controllers/bookController");

//Middleware bodyparse => json
router.use(express.json());

// Manejar la ruta principal de /libraries
router.get('/', (req, res) => {

  res.render("libraries", { titulo: `Librerías`});
});

// Manejar rutas específicas de bibliotecas, por ejemplo, /libraries/1
router.get('/:libraryId', (req, res) => {
  const libraryId = req.params.libraryId;
  // Redireccionar a la ruta de libros de la biblioteca
  res.redirect(`/libraries/${libraryId}/books`);
});

router.get('/:libraryId/books', bookController.getBooks);
router.get("/:libraryId/books/:idBook/bookmarks", bookController.getBookmarks);

module.exports = router;