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
  }
}