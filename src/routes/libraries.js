const express = require("express");
const router = express.Router();

const bookController = require("../controllers/bookController");
const configController = require("../controllers/configController");
const libraryController = require('../controllers/libraryController');
const authorController = require('../controllers/authorController');
const configDB = require('../data/configDB');
const database = require('../data/database');

//Middleware bodyparse => json
router.use(express.json());

// Manejar la ruta principal de /libraries - Vista
router.get('/', (req, res) => {
  // Obtener las librerías para pasarlas a la vista
  const libraries = configDB.getLibraries();
  const activeLibrary = configDB.getActiveLibrary();
  
  // Añadir la cantidad de libros con marcadores a cada librería
  for (let library of libraries) {
    try {
      // Establecer la conexión a la base de datos de la librería
      const connection = database.getConnection(library.path_db);
      
      if (connection) {
        // Contar los libros únicos que tienen marcadores (los que aparecen en la vista books)
        const stmt = connection.prepare(`
          SELECT COUNT(DISTINCT VolumeID) as totalBooks 
          FROM Bookmark
        `);
        
        const result = stmt.get();
        library.bookCount = result ? result.totalBooks : 0;
      } else {
        library.bookCount = 0;
      }
    } catch (error) {
      console.log(`Error al obtener la cantidad de libros para la librería ${library.name}:`, error.message);
      library.bookCount = 0;
    }
  }
  
  // Cerrar la conexión y restaurar la conexión a la librería activa
  if (activeLibrary) {
    database.getConnection(activeLibrary.path_db);
  } else {
    database.closeConnection();
  }
  
  res.render("libraries", { 
    titulo: `Librerías`,
    libraries: libraries,
    activeLibrary: activeLibrary
  });
});

// Manejar rutas específicas de bibliotecas, por ejemplo, /libraries/1
router.get('/:libraryId', (req, res) => {
  const libraryId = req.params.libraryId;
  // Redireccionar a la ruta de libros de la biblioteca
  res.redirect(`/libraries/${libraryId}/books`);
});

// Rutas para vistas de libros y configuraciones
router.get('/:libraryId/books', bookController.getBooks);
router.get('/:libraryId/settings', configController.show);
router.get("/:libraryId/books/:idBook/bookmarks", bookController.getBookmarks);

// Rutas para vistas de autores
router.get('/:libraryId/authors', authorController.getAuthors);
router.get('/:libraryId/authors/:authorId/books', authorController.getAuthorBooks);
router.get('/:libraryId/authors/:authorId/bookmarks', authorController.getAuthorBookmarks);

// Rutas API para la gestión de librerías
router.get('/api/list', libraryController.getLibraries);
router.get('/api/active', libraryController.getActiveLibrary);
router.get('/api/:id', libraryController.getLibrary);
router.post('/api/verify', libraryController.uploadDatabaseMiddleware, libraryController.verifyDatabase);
router.post('/api/save', libraryController.uploadDatabaseMiddleware, libraryController.saveLibrary);
router.put('/api/:id/activate', libraryController.activateLibrary);
router.delete('/api/:id', libraryController.deleteLibrary);

module.exports = router;