const db = require('../data/database');
const md5 = require('md5');
const NodeCache = require('node-cache');

const localCache = new NodeCache();

// Función para extraer el autor de un VolumeID
function extraerAutor(volumeID) {
  volumeID = volumeID.replace("_", ".")
  let a_datos = volumeID.split("/");
  let autor = a_datos[5].split(", ");

  if (autor.length > 1) {
    return (autor[1] + " " + autor[0]);
  } else {
    return autor[0];
  }
}

// Notificación cuando se añade algo al caché
localCache.on("set", function(key, value){
  console.log(`\x1b[32m [cache] add '${key}' => localCache \x1b[0m`);
});

module.exports = {
  getAuthors: function() {
    // Obtener la conexión actual para verificar la base de datos
    const currentConnection = db.getConnection();
    const cacheKey = `authors_${db.connectionPath}`;
    
    // Si hay una conexión y el caché tiene datos para esta conexión específica
    if (currentConnection && localCache.has(cacheKey)) {
      console.log(`\x1b[32m [cache] get '${cacheKey}' => from localCache \x1b[0m`);
      return { "status": "OK", "data": localCache.get(cacheKey) };
    } else {
      try {
        // Primero obtenemos todos los libros
        const stmtBooks = db.getConnection().prepare(`
            SELECT 
            b.VolumeID,
            (SELECT c.BookTitle from content c WHERE c.BookID LIKE b.VolumeID GROUP BY c.BookTitle) As 'BookTitle',
            COUNT(b.VolumeID) As 'Bookmarks',
            (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
            WHERE bs."Type" LIKE 'dogear' AND bs.VolumeID = b.VolumeID) As 'Dogears',
            (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
            WHERE (bs."Type" LIKE 'highlight' OR bs."Type" IS NULL) AND bs.VolumeID = b.VolumeID) As 'Highlights',
            (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
            WHERE bs."Type" LIKE 'note' AND bs.Annotation NOT LIKE '>c:%' AND bs.Annotation NOT LIKE '>p:%' AND bs.Annotation NOT LIKE '>p:%' AND bs.Annotation NOT LIKE '>d:%' AND bs.Annotation NOT LIKE '^:%' AND bs.Annotation NOT LIKE '#:%' AND bs.Annotation NOT LIKE '@:%' AND bs.VolumeID = b.VolumeID) As 'Annotations',
            (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
            WHERE bs."Type" LIKE 'note' AND (bs.Annotation LIKE '>c:%' OR bs.Annotation LIKE '^:%') AND bs.VolumeID = b.VolumeID) As 'Quotes',
            (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
            WHERE bs."Type" LIKE 'note' AND (bs.Annotation LIKE '>p:%' OR bs.Annotation LIKE '#:%' OR bs.Annotation LIKE '>v:%') AND bs.VolumeID = b.VolumeID) As 'Vocabulary',
            (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
            WHERE bs."Type" LIKE 'note' AND (bs.Annotation LIKE '>d:%' OR bs.Annotation LIKE '@:%') AND bs.VolumeID = b.VolumeID) As 'Definitions',
            (SELECT COUNT(wl.VolumeId) FROM WordList wl
            WHERE wl.VolumeId LIKE b.VolumeID) As 'Words'
            FROM Bookmark b
            GROUP BY b.VolumeID
            ORDER BY COUNT(b.VolumeID) DESC;
        `);
  
        const books = stmtBooks.all();
        
        // Añadir el autor a cada libro
        for (const book of books) {
          book.Autor = extraerAutor(book.VolumeID);
        }
        
        // Agrupar por autor
        const authorsMap = new Map();
        
        for (const book of books) {
          const autor = book.Autor;
          
          if (!authorsMap.has(autor)) {
            authorsMap.set(autor, {
              Autor: autor,
              BookCount: 0,
              Books: [],
              Bookmarks: 0,
              Dogears: 0,
              Highlights: 0,
              Annotations: 0,
              Quotes: 0,
              Vocabulary: 0,
              Definitions: 0,
              Words: 0
            });
          }
          
          const authorData = authorsMap.get(autor);
          authorData.BookCount += 1;
          authorData.Books.push(book);
          authorData.Bookmarks += book.Bookmarks || 0;
          authorData.Dogears += book.Dogears || 0;
          authorData.Highlights += book.Highlights || 0;
          authorData.Annotations += book.Annotations || 0;
          authorData.Quotes += book.Quotes || 0;
          authorData.Vocabulary += book.Vocabulary || 0;
          authorData.Definitions += book.Definitions || 0;
          authorData.Words += book.Words || 0;
        }
        
        // Convertir el mapa a un array y ordenar por cantidad de libros
        const authors = Array.from(authorsMap.values())
          .sort((a, b) => b.BookCount - a.BookCount);
        
        // Añadir un ID único para cada autor
        for (const author of authors) {
          author.id = md5(author.Autor);
        }
        
        // Guardar en caché
        localCache.set(cacheKey, authors, 0);
        console.log(`\x1b[32m [cache] set '${cacheKey}' => to localCache \x1b[0m`);
        
        return { "status": "OK", "data": authors };
      } catch (error) {
        return { "status": "ERROR", "data": error.message };
      }
    }
  },
  
  getAuthorById: function(authorId) {
    try {
      const authors = this.getAuthors().data;
      const author = authors.find(a => a.id === authorId);
      
      if (!author) {
        return { "status": "ERROR", "data": "Autor no encontrado" };
      }
      
      return { "status": "OK", "data": author };
    } catch (error) {
      return { "status": "ERROR", "data": error.message };
    }
  }
}; 