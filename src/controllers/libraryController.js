const configDB = require('../data/configDB');
const database = require('../data/database');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configuración de multer para la carga de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../data/db');
    
    // Crear el directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generar un nombre único para el archivo
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Aceptar solo archivos sqlite
    if (file.originalname.endsWith('.sqlite')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos .sqlite'));
    }
  }
});

module.exports = {
  // Obtener todas las librerías
  getLibraries: function(req, res) {
    try {
      const libraries = configDB.getLibraries();
      res.json({
        success: true,
        libraries: libraries
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },
  
  // Obtener una librería específica
  getLibrary: function(req, res) {
    try {
      const id = parseInt(req.params.id);
      const library = configDB.getLibrary(id);
      
      if (!library) {
        return res.status(404).json({
          success: false,
          message: 'Librería no encontrada'
        });
      }
      
      res.json({
        success: true,
        library: library
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },
  
  // Obtener la librería activa
  getActiveLibrary: function(req, res) {
    try {
      const library = configDB.getActiveLibrary();
      
      if (!library) {
        return res.json({
          success: true,
          active: false,
          message: 'No hay librería activa'
        });
      }
      
      res.json({
        success: true,
        active: true,
        library: library
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },
  
  // Middleware para manejar la carga de archivos
  uploadDatabaseMiddleware: upload.single('database'),
  
  // Verificar una base de datos subida
  verifyDatabase: function(req, res) {
    try {
      // Si no hay archivo, verificar la ruta proporcionada
      if (!req.file && req.body.path) {
        const dbPath = req.body.path;
        
        // Verificar que la ruta existe
        if (!fs.existsSync(dbPath)) {
          return res.json({
            success: false,
            valid: false,
            message: 'La ruta de la base de datos no existe'
          });
        }
        
        // Verificar que es una base de datos SQLite válida
        const isValid = database.validateSQLiteDB(dbPath);
        
        return res.json({
          success: true,
          valid: isValid,
          message: isValid ? 'Base de datos válida' : 'El archivo no es una base de datos SQLite válida o no contiene las tablas esperadas'
        });
      }
      
      // Si hay archivo subido, verificarlo
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha subido ningún archivo'
        });
      }
      
      const dbPath = req.file.path;
      const isValid = database.validateSQLiteDB(dbPath);
      
      if (!isValid) {
        // Si no es válido, eliminar el archivo
        fs.unlinkSync(dbPath);
      }
      
      res.json({
        success: true,
        valid: isValid,
        message: isValid ? 'Base de datos válida' : 'El archivo no es una base de datos SQLite válida o no contiene las tablas esperadas',
        file: isValid ? req.file : null
      });
    } catch (error) {
      // Si hay error, intentar eliminar el archivo si existe
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error eliminando archivo:', unlinkError);
        }
      }
      
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },
  
  // Crear o actualizar una librería
  saveLibrary: function(req, res) {
    try {
      // Si no hay archivo subido, verificar si se proporciona una ruta
      if (!req.file && !req.body.path_db) {
        return res.status(400).json({
          success: false,
          message: 'No se ha subido ningún archivo o proporcionado una ruta'
        });
      }
      
      // Datos de la librería
      const libraryData = {
        name: req.body.name,
        description: req.body.description || '',
        type_db: 'sqlite',
        path_db: req.file ? req.file.path : req.body.path_db
      };
      
      // Validar que la ruta existe
      if (!fs.existsSync(libraryData.path_db)) {
        return res.status(400).json({
          success: false,
          message: 'La ruta de la base de datos no existe'
        });
      }
      
      // Validar que es una base de datos SQLite válida
      if (!database.validateSQLiteDB(libraryData.path_db)) {
        // Si no es válida y se subió un archivo, eliminarlo
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        
        return res.status(400).json({
          success: false,
          message: 'El archivo no es una base de datos SQLite válida o no contiene las tablas esperadas'
        });
      }
      
      // Guardar la librería
      const id = configDB.saveLibrary(libraryData);
      
      // Si es la primera librería, activarla automáticamente
      const libraries = configDB.getLibraries();
      if (libraries.length === 1) {
        configDB.setActiveLibrary(id);
      }
      
      res.json({
        success: true,
        id: id,
        message: 'Librería guardada correctamente'
      });
    } catch (error) {
      // Si hay error y se subió un archivo, intentar eliminarlo
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error eliminando archivo:', unlinkError);
        }
      }
      
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },
  
  // Activar una librería
  activateLibrary: function(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      // Verificar que la librería existe
      const library = configDB.getLibrary(id);
      if (!library) {
        return res.status(404).json({
          success: false,
          message: 'Librería no encontrada'
        });
      }
      
      // Verificar que el archivo existe
      if (!fs.existsSync(library.path_db)) {
        return res.status(400).json({
          success: false,
          message: 'El archivo de la base de datos no existe'
        });
      }
      
      // Activar la librería
      configDB.setActiveLibrary(id);
      
      // Cerrar la conexión actual y forzar una nueva conexión
      database.closeConnection();
      
      res.json({
        success: true,
        message: 'Librería activada correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },
  
  // Eliminar una librería
  deleteLibrary: function(req, res) {
    try {
      const id = parseInt(req.params.id);
      
      // Verificar que la librería existe
      const library = configDB.getLibrary(id);
      if (!library) {
        return res.status(404).json({
          success: false,
          message: 'Librería no encontrada'
        });
      }
      
      // Si es la librería activa, cerrar la conexión
      if (library.is_active) {
        database.closeConnection();
      }
      
      // Eliminar la librería
      configDB.deleteLibrary(id);
      
      res.json({
        success: true,
        message: 'Librería eliminada correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}; 