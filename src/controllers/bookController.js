const book = require('../models/book');
const bookmark = require('../models/bookmark');
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
  let highlights = bookmark.getBookmarksById(book_id);
  let words =  bookmark.getWordsById(book_id).data;
  let [bookBefore,bookAfter] = book.getBooksBeforeAfter(book_id).data;
  
  res.render("bookmarks", { layout: 'lay_bookmarks', helpers: { eachListBookmarks: renderListBookmarks, showListWords: renderListWords}, titulo: "Resaltados", lang: selected_lang, book: book_info.data, highlights: highlights.data, bookBefore: bookBefore, bookAfter: bookAfter, words: words });
};

exports.getPoks = async (req, res) => {
  let poks = await book.getpokemons();
  console.log("llamado");
  res.json({"data":poks,"status":"ok","message": "lista de libros"});
};

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
        <div class="bg-light">
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
        <div class="bg-light">
          <div class="hstack gap-3">
            <div class="bg-light"><span class="badge rounded-pill ${categoryClassCSS}">${category}</span></div>
            <div class="bg-light border ms-auto"></div>
            <div class="bg-light">${buttons}<button type="button" class="btn btn-outline-dark btn-sm btn-copy" data-bcup-haslogintext="no"><i class="fad fa-copy pe-2"></i>Copiar</button>
            </div>
          </div>
        </div>
        <hr>
      </div>`;
  }
  return list_content_highlights;
}

function renderListWords(aWords) {
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