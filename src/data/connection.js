const Database = require('better-sqlite3');
const md5 = require('md5');

const db = new Database('./src/data/KoboReader.sqlite', { verbose: console.log('Ejecucion .sqlite: OK') });

// const row = db.prepare(`SELECT * FROM Bookmark b WHERE b.VolumeID LIKE 'file:///mnt/onboard/Precht, Richard David/Amor. Un sentimiento desordenado - Richard David Precht.epub' LIMIT 10`).get();

function traerResaltes(params) {
  const stmt = db.prepare(`SELECT b.BookmarkID, b.VolumeID FROM Bookmark b WHERE b.VolumeID LIKE 'file:///mnt/onboard/Precht, Richard David/Amor. Un sentimiento desordenado - Richard David Precht.epub' LIMIT 2`);

  let rows = stmt.all();

  for (const bookmark of rows) {
    bookmark.md5 = md5(bookmark.VolumeID);
  }
  console.log(rows);
}

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

function async_traerLibros() {
  try {
    const stmt = db.prepare(`
        SELECT 
        b.VolumeID,
        (SELECT c.BookTitle from content c WHERE c.BookID LIKE b.VolumeID GROUP BY c.BookTitle) As 'BookTitle',
        COUNT(b.VolumeID) As 'Resaltes',
        (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
        WHERE bs."Type" LIKE 'dogear' AND bs.VolumeID = b.VolumeID) As 'Marcadores',
        (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
        WHERE (bs."Type" LIKE 'highlight' OR bs."Type" IS NULL) AND bs.VolumeID = b.VolumeID) As 'Subrayados',
        (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
        WHERE bs."Type" LIKE 'note' AND bs.Annotation NOT LIKE '>c:%' AND bs.Annotation NOT LIKE '>p:%' AND bs.Annotation NOT LIKE '>d:%' AND bs.VolumeID = b.VolumeID) As 'Anotaciones',
        (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
        WHERE bs."Type" LIKE 'note' AND bs.Annotation LIKE '>c:%' AND bs.VolumeID = b.VolumeID) As 'Citas',
        (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
        WHERE bs."Type" LIKE 'note' AND (bs.Annotation LIKE '>p:%' OR bs.Annotation LIKE '>v:%') AND bs.VolumeID = b.VolumeID) As 'Vocabulario',
        (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
        WHERE bs."Type" LIKE 'note' AND bs.Annotation LIKE '>d:%' AND bs.VolumeID = b.VolumeID) As 'Definiciones',
        (SELECT COUNT(wl.VolumeId) FROM WordList wl
        WHERE wl.VolumeId LIKE b.VolumeID) As 'Palabras'
        FROM Bookmark b
        GROUP BY b.VolumeID
        ORDER BY COUNT(b.VolumeID) DESC;`);

    var rows = stmt.all();

    for (const bookmark of rows) {
      bookmark.md5 = md5(bookmark.VolumeID);
      bookmark.Autor = extraerAutor(bookmark.VolumeID);
      bookmark.IdEncode = encodeURIComponent(bookmark.VolumeID);
    }


    return { "status": "OK", "data": rows };
    //return rows;

  } catch (error) {
    return { "status": "ERROR", "data": error };

  }
}

function async_traerLibroPorId(VolumeID) {
  try {
    const stmt = db.prepare(`
        SELECT 
        b.VolumeID,
        (SELECT c.BookTitle from content c WHERE c.BookID LIKE b.VolumeID GROUP BY c.BookTitle) As 'BookTitle',
        COUNT(b.VolumeID) As 'Bookmarks',
        (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
        WHERE bs."Type" LIKE 'dogear' AND bs.VolumeID = b.VolumeID) As 'Dogears',
        (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
        WHERE (bs."Type" LIKE 'highlight' OR bs."Type" IS NULL) AND bs.VolumeID = b.VolumeID) As 'Highlights',
        (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
        WHERE bs."Type" LIKE 'note' AND bs.Annotation NOT LIKE '>c:%' AND bs.Annotation NOT LIKE '>p:%' AND bs.Annotation NOT LIKE '>v:%' AND bs.Annotation NOT LIKE '>d:%' AND bs.VolumeID = b.VolumeID) As 'Annotations',
        (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
        WHERE bs."Type" LIKE 'note' AND bs.Annotation LIKE '>c:%' AND bs.VolumeID = b.VolumeID) As 'Quotes',
        (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
        WHERE bs."Type" LIKE 'note' AND (bs.Annotation LIKE '>p:%' OR bs.Annotation LIKE '>v:%') AND bs.VolumeID = b.VolumeID) As 'Vocabulary',
        (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
        WHERE bs."Type" LIKE 'note' AND bs.Annotation LIKE '>d:%' AND bs.VolumeID = b.VolumeID) As 'Definitions',
        (SELECT COUNT(wl.VolumeId) FROM WordList wl
        WHERE wl.VolumeId LIKE b.VolumeID) As 'Words'
        FROM Bookmark b
        WHERE b.VolumeID LIKE ?;`);

    var rows = stmt.all(VolumeID);

    for (const bookmark of rows) {
      bookmark.md5 = md5(bookmark.VolumeID);
      bookmark.Autor = extraerAutor(bookmark.VolumeID);
      bookmark.IdEncode = encodeURIComponent(bookmark.VolumeID);
    }

    return { "status": "OK", "data": rows[0] };
  } catch (error) {
    return { "status": "ERROR", "data": error };
  }
}

function async_traerResaltes(VolumeID) {
  try {
    const stmt = db.prepare(`
        SELECT
        b.*,
        c.Title As TitleChapter,
        CASE 
            WHEN b."Type" LIKE 'note' AND (b.Annotation LIKE '>p:%' OR b.Annotation LIKE '>v:%') THEN 'vocabulary'
            WHEN b."Type" LIKE 'note' AND b.Annotation LIKE '>d:%' THEN 'definition' 
            WHEN b."Type" LIKE 'note' AND b.Annotation LIKE '>c:%' THEN 'quote' 
            WHEN b."Type" IS NULL THEN 'highlight' 
            ELSE b."Type" END Category
        FROM Bookmark b
        INNER JOIN content c ON c.ContentID = b.ContentID
        WHERE b.VolumeID LIKE ?;`);
    // ORDER BY b."Type" DESC;`);
    var rows = stmt.all(VolumeID);

    return { "status": "OK", "data": rows };
  } catch (error) {
    return { "status": "ERROR", "data": error };
  }
}

function async_getBookmarks(VolumeID, filters) {
  
  let filter_orderBy = '';
  let filter_limit = '';
  let filter_only = '';

  if (filters.only) {
    console.log('[ ✅ ] ONLY');
    filter_only += "AND Category LIKE '" + filters.only + "' ";
  }

  if (filters.orderBy) {
    console.log('[ ✅ ] ORDER BY');
    filter_orderBy += 'ORDER BY ';
    switch (filters.orderBy) {
      case "20":
        filter_orderBy += 'Category ASC ';
        break;
      case "21":
        filter_orderBy += 'Category DESC ';
        break;
      case "30":
        filter_orderBy += 'b.DateCreated ASC ';
        break;
      case "31":
        filter_orderBy += 'b.DateCreated DESC ';
        break;
      case "230":
        filter_orderBy += 'Category ASC, b.DateCreated ASC ';
        break;
      case "231":
        filter_orderBy += 'Category DESC, b.DateCreated DESC ';
        break;
      default:
        filter_orderBy = '';
        break;
    }
  } 

  if (filters.limit) {
    console.log('[ ✅ ] LIMIT');
    filter_limit += "LIMIT " + filters.limit;
  }

  try {
    const stmt = db.prepare(`
        SELECT
        b.*,
        c.Title As TitleChapter,
        CASE 
            WHEN b."Type" LIKE 'note' AND (b.Annotation LIKE '>p:%' OR b.Annotation LIKE '>v:%') THEN 'vocabulary'
            WHEN b."Type" LIKE 'note' AND b.Annotation LIKE '>d:%' THEN 'definition' 
            WHEN b."Type" LIKE 'note' AND b.Annotation LIKE '>c:%' THEN 'quote' 
            WHEN b."Type" IS NULL THEN 'highlight' 
            ELSE b."Type" END Category
        FROM Bookmark b
        INNER JOIN content c ON c.ContentID = b.ContentID
        WHERE b.VolumeID LIKE ? ` + filter_only + filter_orderBy + filter_limit + `;`);
    // ORDER BY b."Type" DESC;`);
    var rows = stmt.all(VolumeID);
    //console.log(rows);
    console.log(filters);
    return { "status": 200, "msg": 'OK', "data": rows };
  } catch (error) {
    return { "status": 500, "msg": error.code + ' => ' + error.message};
  }
}
                                                                                          
function async_getBooksFiltered(listColumn = false) {
  let columns_select = "";
  let columns_quantity = 9;

  if (!listColumn) {
    columns_select += `b.VolumeID,
    (SELECT c.BookTitle from content c WHERE c.BookID LIKE b.VolumeID GROUP BY c.BookTitle) As 'BookTitle',
    COUNT(b.VolumeID) As 'Bookmarks',
    (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
    WHERE bs."Type" LIKE 'dogear' AND bs.VolumeID = b.VolumeID) As 'Dogears',
    (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
    WHERE (bs."Type" LIKE 'highlight' OR bs."Type" IS NULL) AND bs.VolumeID = b.VolumeID) As 'Highlights',
    (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
    WHERE bs."Type" LIKE 'note' AND bs.Annotation NOT LIKE '>c:%' AND bs.Annotation NOT LIKE '>p:%' AND bs.Annotation NOT LIKE '>d:%' AND bs.VolumeID = b.VolumeID) As 'Notes',
    (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
    WHERE bs."Type" LIKE 'note' AND bs.Annotation LIKE '>c:%' AND bs.VolumeID = b.VolumeID) As 'Quotes',
    (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
    WHERE bs."Type" LIKE 'note' AND (bs.Annotation LIKE '>p:%' OR bs.Annotation LIKE '>v:%') AND bs.VolumeID = b.VolumeID) As 'Vocabulary',
    (SELECT COUNT(bs.VolumeID) FROM Bookmark bs
    WHERE bs."Type" LIKE 'note' AND bs.Annotation LIKE '>d:%' AND bs.VolumeID = b.VolumeID) As 'Definitions',
    (SELECT COUNT(wl.VolumeId) FROM WordList wl
    WHERE wl.VolumeId LIKE b.VolumeID) As 'Words'`;
  } else {
    columns_quantity = listColumn.length;

    for (let index = 0; index < listColumn.length; index++) {
      if (listColumn[index] == 'VolumeID') {
        columns_select += "b.VolumeID";
      }
      if (listColumn[index] == 'BookTitle') {
        columns_select += "(SELECT c.BookTitle from content c WHERE c.BookID LIKE b.VolumeID GROUP BY c.BookTitle) As 'BookTitle'";
      }
      if (listColumn[index] == 'Bookmarks') {
        columns_select += `COUNT(b.VolumeID) As 'Bookmarks'`;
      }
      if (listColumn[index] == 'Dogears') {
        columns_select += `(SELECT COUNT(bs.VolumeID) FROM Bookmark bs WHERE bs."Type" LIKE 'dogear' AND bs.VolumeID = b.VolumeID) As 'Dogears'`;
      }
      if (listColumn[index] == 'Highlights') {
        columns_select += `(SELECT COUNT(bs.VolumeID) FROM Bookmark bs WHERE (bs."Type" LIKE 'highlight' OR bs."Type" IS NULL) AND bs.VolumeID = b.VolumeID) As 'Highlights'`;
      }
      if (listColumn[index] == 'Notes') {
        columns_select += `(SELECT COUNT(bs.VolumeID) FROM Bookmark bs WHERE bs."Type" LIKE 'note' AND bs.Annotation NOT LIKE '>c:%' AND bs.Annotation NOT LIKE '>p:%' AND bs.Annotation NOT LIKE '>d:%' AND bs.VolumeID = b.VolumeID) As 'Notes'`;
      }
      if (listColumn[index] == 'Quotes') {
        columns_select += `(SELECT COUNT(bs.VolumeID) FROM Bookmark bs WHERE bs."Type" LIKE 'note' AND bs.Annotation LIKE '>c:%' AND bs.VolumeID = b.VolumeID) As 'Quotes'`;
      }
      if (listColumn[index] == 'Vocabulary') {
        columns_select += `(SELECT COUNT(bs.VolumeID) FROM Bookmark bs WHERE bs."Type" LIKE 'note' AND (bs.Annotation LIKE '>p:%' OR bs.Annotation LIKE '>v:%') AND bs.VolumeID = b.VolumeID) As 'Vocabulary'`;
      }
      if (listColumn[index] == 'Definitions') {
        columns_select += `(SELECT COUNT(bs.VolumeID) FROM Bookmark bs WHERE bs."Type" LIKE 'note' AND bs.Annotation LIKE '>d:%' AND bs.VolumeID = b.VolumeID) As 'Definitions'`;
      }
      if (listColumn[index] == 'Words') {
        columns_select += `(SELECT COUNT(wl.VolumeId) FROM WordList wl WHERE wl.VolumeId LIKE b.VolumeID) As 'Words'`;
      }

      if ((listColumn.length > 1 && index != (listColumn.length - 1 )) && index < listColumn.length) {
        columns_select += ','
      }
    }
  }

  try {
    const stmt = db.prepare(`
        SELECT
        ${columns_select}
        FROM Bookmark b
        GROUP BY b.VolumeID
        ORDER BY COUNT(b.VolumeID) DESC;`);

    var rows = stmt.all();

    if (columns_quantity >= 3) {
      for (const bookmark of rows) {
        bookmark.Autor = extraerAutor(bookmark.VolumeID);
        bookmark.md5 = md5(bookmark.VolumeID);
        bookmark.IdEncode = encodeURIComponent(bookmark.VolumeID);
      }
    }

    return { "status": "OK", "data": rows };
  } catch (error) {
    return { "status": "ERROR", "data": error };

  }
}

function async_traerPalabras(VolumeID) {
  try {
    const stmt = db.prepare(`
        SELECT *
        FROM WordList wl
        WHERE wl.VolumeId LIKE ?;`);
    var rows = stmt.all(VolumeID);
    return { "status": "OK", "data": rows };
  } catch (error) {
    return { "status": "ERROR", "data": error };
  }
}

module.exports = {
  traerLibros: async_traerLibros,
  traerResaltesLibros: async_traerResaltes,
  traerLibroPorId: async_traerLibroPorId,
  traerPalabrasVocabularioDeLibro: async_traerPalabras,
  getBookmars: async_getBookmarks,
  getBooksFiltered: async_getBooksFiltered
};

