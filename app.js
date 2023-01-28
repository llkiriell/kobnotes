const express = require("express");
const expbs = require("express-handlebars");
const db = require('./src/data/connection');
const fs = require('fs');
const app = express();
const hbs = expbs.create({
  extname: ".hbs",
  helpers: {
    eachListHighlights: eachListHighlights
  }
});

app.use(express.static(__dirname + "/public/views"));
app.use(express.static(__dirname + "/public/assets"));

app.set("view engine", ".hbs");
app.engine(".hbs", hbs.engine);
app.set("views", "./public/views");

//Functions
function eachListHighlights(aHighlights){
  let list_content_highlights = '';

  for (let index = 0; index < aHighlights.length; index++) {
      //console.log( (index+1) + ' => ' + aHighlights[index].Category);
      if (aHighlights[index].Category == 'highlight') {
          list_content_highlights += `
            <div class="row pt-2 bookmark highlight" data-bookmark-category="highlight">
                <div class="col-xxl-1 text-center">
                  <div class="col-xxl-12 text-center">
                    <i class="fad fa-highlighter"></i>
                  </div>
                  <div class="col-xxl-12 text-center">
                    #${index+1}
                  </div>
                </div>
                <div class="col-xxl-11 pb-4">
                    <div class="row">
                        <div class="col-sm-12">
                            <h5>${aHighlights[index].Text}</h5>
                        </div>
                        <div class="col-sm-12 gy-2">
                          <figure>
                            <figcaption class="blockquote-footer pt-2">${aHighlights[index].TitleChapter}</figcaption>
                          </figure>
                          <button type="button" class="btn btn-outline-dark btn-sm btn-copiar" data-bcup-haslogintext="no"><i class="fad fa-copy pe-1"></i> Copiar</button>
                        </div>
                    </div>
                </div>
                <hr>
            </div>`;
        } else if (aHighlights[index].Category == 'note') {
          list_content_highlights += `
            <div class="row pt-2 bookmark note" data-bookmark-category="note">
                <div class="col-xxl-1 text-center">
                  <div class="col-xxl-12 text-center">
                    <i class="fad fa-pencil pe-1"></i>
                  </div>
                  <div class="col-xxl-12 text-center">
                    #${index+1}
                  </div>
                </div>
                <div class="col-xxl-11 pb-4">
                    <div class="row">
                        <div class="col-sm-12">
                            <h5>${aHighlights[index].Text}</h5>
                            <p>${aHighlights[index].Annotation}</p>
                        </div>
                        <div class="col-sm-12 gy-2">
                          <figure>
                            <figcaption class="blockquote-footer">${aHighlights[index].TitleChapter}</figcaption>
                          </figure>
                          <button type="button" class="btn btn-outline-dark btn-sm btn-copiar" data-bcup-haslogintext="no"><i class="fad fa-copy pe-1"></i> Copiar</button>
                        </div>
                    </div>
                </div>
                <hr>
            </div>`;
        } else if (aHighlights[index].Category == 'quote') {
          list_content_highlights += `
            <div class="row pt-2 bookmark quote" data-bookmark-category="quote">
              <div class="col-xxl-1 text-center">
                <div class="col-xxl-12 text-center">
                  <i class="fad fa-quote-right"></i>
                </div>
                <div class="col-xxl-12 text-center">
                  #${index+1}
                </div>
              </div>
              <div class="col-xxl-11 pb-4">
                <div class="row">
                    <div class="col-sm-12">
                    <figure>
                        <blockquote class="blockquote">
                        <p>${aHighlights[index].Text}.</p>
                        </blockquote>
                        <figcaption class="blockquote-footer pt-2">
                        ${aHighlights[index].TitleChapter}
                        </figcaption>
                    </figure>
                    </div>
                    <div class="col-sm-12 gy-2">
                      <button type="button" class="btn btn-outline-dark btn-sm btn-copiar" data-bcup-haslogintext="no"><i class="fad fa-copy pe-1"></i> Copiar</button>
                    </div>
                </div>
              </div>
              <hr>
            </div>`;
      } else if (aHighlights[index].Category == 'vocabulary') {
          list_content_highlights += `
            <div class="row pt-2 bookmark vocabulary" data-bookmark-category="vocabulary">
                <div class="col-xxl-1 text-center">
                  <div class="col-xxl-12 text-center">
                    <i class="fad fa-book"></i>
                  </div>
                  <div class="col-xxl-12 text-center">
                    #${index+1}
                  </div>
                </div>
                <div class="col-xxl-11 pb-4">
                    <div class="row">
                        <div class="col-sm-12">
                            <h5 class="text-capitalize">${aHighlights[index].Text.trim().replace(/[^á-úA-Za-z]/g,'')}</h5>
                            <p class="d-none"></p>
                        </div>
                        <div class="col-sm-12 gy-2">
                          <figure>
                            <figcaption class="blockquote-footer pt-2">${aHighlights[index].TitleChapter}</figcaption>
                          </figure>
                          <button type="button" class="btn btn-outline-dark btn-sm btn-copiar" data-bcup-haslogintext="no"><i class="fad fa-copy pe-1"></i> Copiar</button>
                          <a href="https://dle.rae.es/${aHighlights[index].Text.trim().replace(/[^á-úA-Za-z]/g,'')}" class="btn btn-outline-dark btn-sm" target="_blank"><i class="fad fa-spell-check pe-1"></i>DRAE</a>
                        </div>
                    </div>
                </div>
                <hr>
            </div>`;
        } else if (aHighlights[index].Category == 'definition') {
          list_content_highlights += `
            <div class="row pt-2 bookmark definition" data-bookmark-category="definition">
                <div class="col-xxl-1 text-center">
                    <div class="col-xxl-12 text-center">
                      <i class="fad fa-graduation-cap"></i>
                    </div>
                    <div class="col-xxl-12 text-center">
                      #${index+1}
                    </div>
                </div>
                <div class="col-xxl-11 pb-4">
                    <div class="row">
                        <div class="col-sm-12">
                            <h5>${aHighlights[index].Text}</h5>
                        </div>
                        <div class="col-sm-12 gy-2">
                          <figure>
                            <figcaption class="blockquote-footer pt-2">${aHighlights[index].TitleChapter}</figcaption>
                          </figure>
                          <button type="button" class="btn btn-outline-dark btn-sm btn-copiar" data-bcup-haslogintext="no"><i class="fad fa-copy pe-1"></i> Copiar</button>
                          <a href="https://www.google.com/search?q=${aHighlights[index].Text}" class="btn btn-outline-dark btn-sm" target="_blank"><i class="fab fa-google pe-1"></i>Buscar</a>
                        </div>
                    </div>
                </div>
                <hr>
            </div>`;
        }
  }
  return list_content_highlights;
}

// Paths
app.get("/", (req, res) => {
  res.send('inicio');
});

app.get("/library/books", async (req, res) => {
  let rpta = await db.traerLibros();
  res.render("books", { layout: 'lay_books', titulo: "Librería", books: rpta.data });
});

app.get("/library/book/:idBook/bookmarks",async (req,res) => {

  let book_id = req.params.idBook;
  let rpta = await db.traerLibroPorId(book_id);

  let book_data = rpta.data;
  
  //console.log(book_data);
  let rpta_highlights = await db.traerResaltesLibros(book_id);
  let highlights_data = rpta_highlights.data;

  //Tomar texto traducido
  let text = fs.readFileSync(__dirname + "\\public\\assets\\lang\\spanish.json");
  let lang = JSON.parse(text);
  //console.log(lang);

  //traer anterior y siguiente
  // let library_now = await db.getBooksFiltered();
  let library_now = await db.getBooksFiltered(['VolumeID', 'BookTitle']);

  let index_book_anterior = 0;
  let index_book_next = library_now.data.length - 1;

  let book_anterior = '';
  let book_next = '';

  let book_title_anterior = 'Anterior';
  let book_title_next = 'Siguiente';

  for (let index = 0; index < library_now.data.length; index++) {

    if (library_now.data[index].VolumeID == book_id) {

      
      if (index > 0) {
        index_book_anterior = index - 1;
      }

      if (index < (library_now.data.length - 1)) {
        index_book_next = index + 1;
      }

      book_title_anterior = library_now.data[index_book_anterior].BookTitle;
      book_title_next = library_now.data[index_book_next].BookTitle;

      book_anterior = encodeURIComponent(library_now.data[index_book_anterior].VolumeID);
      book_next = encodeURIComponent(library_now.data[index_book_next].VolumeID);

      break;
    }
  }
  //layout personalizado
  res.render("bookmarks", {layout:'lay_bookmarks',titulo: "Resaltados", lang:lang, book: book_data, highlights:highlights_data, bookAnterior: book_anterior, bookNext:book_next, bookTitleAnterior:book_title_anterior,bookTitleNext:book_title_next});
  //res.render("resaltados", {titulo: "Resaltados", book: book_data, highlights:highlights_data});
});


app.listen(5100, () => console.log("Server running..."));