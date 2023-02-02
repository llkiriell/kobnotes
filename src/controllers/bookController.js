const book = require('../models/book');
const fs = require('fs');
let lang = fs.readFileSync(".\\src\\config\\lang\\spanish.json");
let selected_lang = JSON.parse(lang);

exports.getBooks = (req, res) => {
  let books = book.getBooks();
  res.render("books", { layout: 'lay_books', titulo: "Librería", books: books.data });
};

exports.getBookmarks = (req, res) => {
  let book_id = req.params.idBook;
  let book_info = book.getBookById(book_id);
  let highlights = book.getBookmarksById(book_id);
  let [bookBefore,bookAfter] = book.getBooksBeforeAfter(book_id).data;
  
  res.render("bookmarks", {layout:'lay_bookmarks',titulo: "Resaltados", lang:selected_lang, book: book_info.data, highlights:highlights.data, bookBefore: bookBefore, bookAfter:bookAfter});
};

exports.getPoks = async (req, res) => {
  let poks = await book.getpokemons();
  console.log("llamado");
  res.json({"data":poks,"status":"ok","message": "lista de libros"});
};