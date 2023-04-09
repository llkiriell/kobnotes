const db = require('../data/database');

module.exports = {
  getBookmarksById: function (VolumeID) {
    try {
      const stmt = db.getConnection().prepare(`
          SELECT
          b.*,
          c.Title As TitleChapter,
          CASE 
              WHEN b."Type" LIKE 'note' AND (b.Annotation LIKE '>p:%' OR b.Annotation LIKE '>v:%' OR b.Annotation LIKE '#:%') THEN 'vocabulary'
              WHEN b."Type" LIKE 'note' AND (b.Annotation LIKE '>d:%' OR b.Annotation LIKE '@:%') THEN 'definition' 
              WHEN b."Type" LIKE 'note' AND (b.Annotation LIKE '>c:%' OR b.Annotation LIKE '^:%') THEN 'quote' 
              WHEN b."Type" IS NULL THEN 'highlight' 
              ELSE b."Type" END Category
          FROM Bookmark b
          INNER JOIN content c ON c.ContentID = b.ContentID
          WHERE b.VolumeID LIKE ?;`);
      // ORDER BY b."Type" DESC;`);
      var rows = stmt.all(VolumeID);
      return { "status": "OK", "data": rows };
    } catch (error) {
      return { "status": "ERROR", "data": error.message };
    }
  },

  getWordsById: function (VolumeID) {
    try {
      const stmt = db.getConnection().prepare(`
        SELECT wl."Text", wl.DictSuffix, wl.DateCreated FROM WordList wl
        WHERE wl.VolumeId LIKE ?
        ORDER BY wl."Text";
      `);
      let words = stmt.all(VolumeID);
      return { "status": "OK", "data": words };
    } catch (error) {
      return { "status": "ERROR", "data": error.message };
    }
  },

  getBookmarksGroupedById_BK: function (VolumeID) {
    let quotes = [], highlights = [], notes = [], definitions = [], vocabularies = [];
    let bookmarks = this.getBookmarksById(VolumeID).data;
    let bookmarksGrouped = { qty: bookmarks.length };

    bookmarks.forEach(bkmrk => {
      switch (bkmrk.Category) {
        case 'quote':
          quotes.push(bkmrk);
          break;
        case 'highlight':
          highlights.push(bkmrk);
          break;
        case 'note':
          notes.push(bkmrk);
          break;
        case 'definition':
          definitions.push(bkmrk);
          break;
        case 'vocabulary':
          vocabularies.push(bkmrk);
          break;
      }
    });

    if (quotes.length > 0) {
      bookmarksGrouped.quotes = { qty: quotes.length, data: quotes};
    }

    if (highlights.length > 0) {
      bookmarksGrouped.highlights = { qty: highlights.length, data: highlights};
    }

    if (notes.length > 0) {
      bookmarksGrouped.notes = { qty: notes.length, data: notes};
    }

    if (definitions.length > 0) {
      bookmarksGrouped.definitions = { qty: definitions.length, data: definitions};
    }

    if (vocabularies.length > 0) {
      bookmarksGrouped.vocabularies = { qty: vocabularies.length, data: vocabularies};
    }

    return bookmarksGrouped;
  },

  getBookmarksGroupedById: function (VolumeID) {
    let quotes = [], highlights = [], notes = [], definitions = [], vocabularies = [];
    let bookmarks = this.getBookmarksById(VolumeID).data;
    let bookmarksGrouped = { qty: bookmarks.length, groups: [] };

    bookmarks.forEach(bkmrk => {
      switch (bkmrk.Category) {
        case 'quote':
          quotes.push(bkmrk);
          break;
        case 'highlight':
          highlights.push(bkmrk);
          break;
        case 'note':
          notes.push(bkmrk);
          break;
        case 'definition':
          definitions.push(bkmrk);
          break;
        case 'vocabulary':
          vocabularies.push(bkmrk);
          break;
      }
    });

    if (quotes.length > 0) {
      bookmarksGrouped.groups.push({ type: 'quotes', qty: quotes.length, data: quotes });
    }

    if (highlights.length > 0) {
      bookmarksGrouped.groups.push({ type: 'highlights', qty: highlights.length, data: highlights });
    }

    if (notes.length > 0) {
      bookmarksGrouped.groups.push({ type: 'notes', qty: notes.length, data: notes })
    }

    if (definitions.length > 0) {
      bookmarksGrouped.groups.push({ type: 'definitions', qty: definitions.length, data: definitions });
    }

    if (vocabularies.length > 0) {
      bookmarksGrouped.groups.push({ type: 'vocabularies', qty: vocabularies.length, data: vocabularies });
    }

    return bookmarksGrouped;
  }
}