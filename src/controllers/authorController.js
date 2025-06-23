const author = require('../models/author');
const configDB = require('../data/configDB');
const database = require('../data/database');
const book = require('../models/book');
const bookmark = require('../models/bookmark');
const fs = require('fs');
let lang = fs.readFileSync(".\\src\\config\\lang\\spanish.json");
let selected_lang = JSON.parse(lang);

exports.getAuthors = (req, res) => {
  const libraryId = req.params.libraryId;
  
  // Obtener la librería por ID
  const library = configDB.getLibrary(libraryId);
  
  if (!library) {
    return res.status(404).render("error", { 
      layout: 'main',
      titulo: "Error",
      message: "Librería no encontrada"
    });
  }
  
  // Cerrar cualquier conexión existente y establecer la conexión a la base de datos de la librería
  database.closeConnection();
  const connection = database.getConnection(library.path_db);
  
  if (!connection) {
    return res.status(500).render("error", { 
      layout: 'main',
      titulo: "Error",
      message: "No se pudo conectar a la base de datos de la librería"
    });
  }
  
  let authors = author.getAuthors();
  res.render("authors", { 
    layout: 'lay_authors', 
    titulo: `Autores - ${library.name}`,
    libraryId: libraryId, 
    authors: authors.data, 
    library: library
  });
};

exports.getAuthorBooks = (req, res) => {
  const libraryId = req.params.libraryId;
  const authorId = req.params.authorId;
  
  // Obtener la librería por ID
  const library = configDB.getLibrary(libraryId);
  
  if (!library) {
    return res.status(404).render("error", { 
      layout: 'main',
      titulo: "Error",
      message: "Librería no encontrada"
    });
  }
  
  // Cerrar cualquier conexión existente y establecer la conexión a la base de datos de la librería
  database.closeConnection();
  const connection = database.getConnection(library.path_db);
  
  if (!connection) {
    return res.status(500).render("error", { 
      layout: 'main',
      titulo: "Error",
      message: "No se pudo conectar a la base de datos de la librería"
    });
  }
  
  let authorData = author.getAuthorById(authorId);
  
  if (authorData.status === "ERROR") {
    return res.status(404).render("error", { 
      layout: 'main',
      titulo: "Error",
      message: "Autor no encontrado"
    });
  }
  
  res.render("author_books", { 
    layout: 'lay_author_books', 
    titulo: `Libros de ${authorData.data.Autor}`,
    libraryId: libraryId, 
    author: authorData.data, 
    books: authorData.data.Books,
    library: library
  });
};

exports.getAuthorBookmarks = (req, res) => {
  const libraryId = req.params.libraryId;
  const authorId = req.params.authorId;
  
  // Obtener la librería por ID
  const library = configDB.getLibrary(libraryId);
  
  if (!library) {
    return res.status(404).render("error", { 
      layout: 'main',
      titulo: "Error",
      message: "Librería no encontrada"
    });
  }
  
  // Cerrar cualquier conexión existente y establecer la conexión a la base de datos de la librería
  database.closeConnection();
  const connection = database.getConnection(library.path_db);
  
  if (!connection) {
    return res.status(500).render("error", { 
      layout: 'main',
      titulo: "Error",
      message: "No se pudo conectar a la base de datos de la librería"
    });
  }
  
  let authorData = author.getAuthorById(authorId);
  
  if (authorData.status === "ERROR") {
    return res.status(404).render("error", { 
      layout: 'main',
      titulo: "Error",
      message: "Autor no encontrado"
    });
  }
  
  // Preparar datos de libros con sus marcadores
  const booksWithBookmarks = [];
  
  for (const bookData of authorData.data.Books) {
    const bookInfo = book.getBookById(bookData.VolumeID);
    const bookHighlights = bookmark.getBookmarksById(bookData.VolumeID);
    const bookWords = bookmark.getWordsById(bookData.VolumeID).data || [];
    
    booksWithBookmarks.push({
      book: bookInfo.data,
      highlights: bookHighlights.data,
      words: bookWords
    });
  }
  
  // Recopilar todas las palabras de todos los libros para mostrar en el panel lateral
  const allWords = [];
  booksWithBookmarks.forEach(bookData => {
    if (bookData.words && Array.isArray(bookData.words)) {
      allWords.push(...bookData.words);
    }
  });
  
  res.render("author_bookmarks", { 
    layout: 'lay_author_bookmarks', 
    helpers: { 
      eachListBookmarks: renderListBookmarks, 
      showListWords: renderListWords
    },
    titulo: `Marcadores de ${authorData.data.Autor}`,
    lang: selected_lang,
    libraryId: libraryId,
    author: authorData.data,
    booksWithBookmarks: booksWithBookmarks,
    words: allWords, // Pasar todas las palabras combinadas
    library: library
  });
};

// Funciones auxiliares para renderizar marcadores y palabras
function renderListBookmarks(aHighlights){
  let orderId = 0;
  let list_content_highlights = '';

  for (let index = 0; index < aHighlights.length; index++) {
    let text = (aHighlights[index].Text) ? aHighlights[index].Text.replace(/^[^A-Za-zá-úÁ-Ú\¿¡!—-]/g,'').trim() : '';
    let annotation = (aHighlights[index].Annotation) ? aHighlights[index].Annotation.replace(/(#|\^|@|>[a-z]):/g,'').trim() : '';
    let category;
    let icono = '';
    let textClassCSS = '';
    let categoryClassCSS = '';
    let buttons = '';
    orderId++;

    switch (aHighlights[index].Category) {
      case 'highlight':
        icono = 'fad fa-highlighter';
        textClassCSS = 'kanit';
        text = "<mark class='mark-success'>" + text + "</mark>";
        categoryClassCSS= "text-bg-highlight";
        category = "Subrayado";
        break;
      case 'note':
        icono = 'fad fa-pencil';
        textClassCSS = 'kanit';
        text = "<mark class='mark-primary'>" + text + "</mark>";
        categoryClassCSS= "text-bg-note";
        category = "Anotación";
        break;
      case 'quote':
        icono = 'fad fa-quote-right';
        text = '«' + text + '»';
        textClassCSS = 'labrada'
        categoryClassCSS= "text-bg-quote";
        category = "Cita";
        break;
      case 'vocabulary':
        let {mainWord,highlightedWord,...remains} = deconstructVocabularyAnnotation(annotation);
        icono = 'fad fa-book';
        buttons += `<a href="../../vocabulary/${mainWord}" class="btn btn-warning btn-sm border-0 me-1" target="_blank"><i class="fad fa-hashtag pe-1"></i>${mainWord}</a>`;
        buttons += `<a href="https://www.google.com/search?q=define+${annotation}" class="btn btn-outline-dark btn-sm me-1" target="_blank"><i class="fad fa-search pe-1"></i>Buscar</a>`;
        text = text.replace(highlightedWord,"<mark>" + highlightedWord + "</mark>");
        annotation = '';
        textClassCSS = 'labrada';
        categoryClassCSS= "text-bg-dark";
        category = "Vocabulario";
        break;
      case 'definition':
        icono = 'fad fa-graduation-cap';
        textClassCSS = 'fst-italic';
        categoryClassCSS= "text-bg-definition";
        category = "Definicion";
        buttons = `<a href="https://www.google.com/search?q=${text}" class="btn btn-outline-dark btn-sm me-1" target="_blank"><i class="fad fa-search pe-1"></i>Buscar</a>`;
        break;
      default:
        orderId--;
        continue;
    }

    list_content_highlights += `
      <div class="vstack gap-1">
        <div class="">
          <div class="row pt-2 bookmark ${aHighlights[index].Category}" data-bookmark-category="${aHighlights[index].Category}">
            <div class="col-xxl-1 text-center">
              <div class="col-xxl-12 text-center">
                <i class="${icono}"></i>
              </div>
              <div class="col-xxl-12 text-center">
                #${orderId}
              </div>
            </div>
            <div class="col-xxl-11">
              <div class="row">
                <div class="col-sm-12">
                  <p class="h5 ${textClassCSS}">${text}</p>
                  <p>${annotation}</p>
                </div>
                <div class="col-sm-12 gy-2">
                  <figure>
                    <figcaption class="blockquote-footer pt-2">${aHighlights[index].TitleChapter}</figcaption>
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="">
          <div class="hstack gap-3">
            <div class=""><span class="badge rounded-pill ${categoryClassCSS}">${category}</span></div>
            <div class=" border ms-auto"></div>
            <div class="">${buttons}<button type="button" class="btn btn-outline-dark btn-sm btn-copy" data-bcup-haslogintext="no"><i class="fad fa-copy pe-2"></i>Copiar</button>
            </div>
          </div>
        </div>
        <hr>
      </div>`;
  }
  return list_content_highlights;
}

function renderListWords(aWords) {
  if (!aWords || !Array.isArray(aWords)) {
    return ''; // Devolver cadena vacía si no hay palabras o no es un array
  }
  
  let list_content_word = `<ul class="list-group list-group-flush" style="font-size: 1.1em;--bs-list-group-bg: none!important;">`;

  for (let index = 0; index < aWords.length; index++) {
    list_content_word += `<li class="list-group-item"><div class="hstack gap-3">`;
    list_content_word += `<div class="labrada">${aWords[index].Text.trim().replace(/[^á-úA-Za-z]/g,'')}</div>`;
    list_content_word += `<div class="ms-auto"></div>`;
    list_content_word += `<div class=""><a href="https://www.google.com/search?q=define+${aWords[index].Text.trim().replace(/[^á-úA-Za-z]/g,'')}" title="Buscar definición de la palabra" class="btn btn-light btn-sm rounded-circle" target="_blank" data-bcup-haslogintext="no"><i class="fad fa-search"></i></a></div>`;
    list_content_word += `</div></li>`;
  }

  list_content_word += `</ul>`;
  return list_content_word;
}

function deconstructVocabularyAnnotation(annotation) {
  let deconstructedRes = {isDeconstructed:true,mainWord:null,derivedWord:null,highlightedWord:null};
  let deconstructedAnnotation = annotation.split(';');
  
  if (deconstructedAnnotation.length > 1) {
    deconstructedRes.mainWord = deconstructedAnnotation[0];
    deconstructedRes.derivedWord = deconstructedAnnotation[1];
    deconstructedRes.highlightedWord = deconstructedAnnotation[1];
  }else{
    deconstructedRes.isDeconstructed = false;
    deconstructedRes.mainWord = deconstructedAnnotation[0];
    deconstructedRes.highlightedWord = deconstructedAnnotation[0];
  }
  return deconstructedRes;
} 