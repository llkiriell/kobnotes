const db = require('../data/database');
const md5 = require('md5');
const NodeCache = require('node-cache');

const localCache = new NodeCache();

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
//notification set variable in cache
localCache.on("set", function(key, value){
  console.log(`\x1b[32m [cache] add '${key}' => localCache \x1b[0m`);
});

module.exports = {
  getBooks: function () {
    if (localCache.has("books")) {
      return { "status": "OK", "data": localCache.get('books') };
    } else {
      try {
        const stmt = db.getConnection().prepare(`
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
  
        var rows = stmt.all();
  
        for (const bookmark of rows) {
          bookmark.md5 = md5(bookmark.VolumeID);
          bookmark.Autor = extraerAutor(bookmark.VolumeID);
          bookmark.IdEncode = encodeURIComponent(bookmark.VolumeID);
        }
        //add the books to the cache
        localCache.set("books", rows, 0);

        return { "status": "OK", "data": rows };
      } catch (error) {
        return { "status": "ERROR", "data": error.message };
      }
    }
  },

  getBookById: function (VolumeID) {
    try {
      const stmt = db.getConnection().prepare(`
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
          WHERE b.VolumeID LIKE ?;`);

      var rows = stmt.all(VolumeID);

      for (const bookmark of rows) {
        bookmark.md5 = md5(bookmark.VolumeID);
        bookmark.Autor = extraerAutor(bookmark.VolumeID);
        bookmark.IdEncode = encodeURIComponent(bookmark.VolumeID);
      }

      return { "status": "OK", "data": rows[0] };
    } catch (error) {
      return { "status": "ERROR", "data": error.message };
    }

  },

  getBooksFiltered: function (listColumn = false) {
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

        if ((listColumn.length > 1 && index != (listColumn.length - 1)) && index < listColumn.length) {
          columns_select += ','
        }
      }
    }

    try {
      const stmt = db.getConnection().prepare(`
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
      return { "status": "ERROR", "data": error.message };
    }
  },

  getBooksBeforeAfter:function (VolumeID){
    let booksFiltered;
    //validate books filtered to the cache
    if (localCache.has("booksFiltered")) {
      booksFiltered = localCache.get('booksFiltered');
    } else {
      booksFiltered = this.getBooksFiltered(['VolumeID', 'BookTitle']).data;
      localCache.set("booksFiltered", booksFiltered, 0);
    }

    try {
      let book_before = '';
      let book_after = '';
      let index_book_before = 0;
      let index_book_after = booksFiltered.length - 1;
      let book_title_before = 'Anterior';
      let book_title_after = 'Siguiente';
  
      for (let index = 0; index < booksFiltered.length; index++) {
  
        if (booksFiltered[index].VolumeID == VolumeID) {
          if (index > 0) {
            index_book_before = index - 1;
          }
    
          if (index < (booksFiltered.length - 1)) {
            index_book_after = index + 1;
          }
    
          book_before = encodeURIComponent(booksFiltered[index_book_before].VolumeID);
          book_after = encodeURIComponent(booksFiltered[index_book_after].VolumeID);
          
          book_title_before = booksFiltered[index_book_before].BookTitle;
          book_title_after = booksFiltered[index_book_after].BookTitle;
          break;
        }
      }
      return {"status": "ok","message":"ok", "data":[{"Order":"before","VolumeID":book_before,"BookTitle":book_title_before},{"Order":"after","VolumeID":book_after,"BookTitle":book_title_after}]};
    } catch (error) {
      return {"status": "error","message":error.message, "data":""};
    }
  },

  getpokemons: async function () {
    try {
      let poks = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
      return await poks.json();
    } catch (error) {
      return error.message
    }
  }
}
