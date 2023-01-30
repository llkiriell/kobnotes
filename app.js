const dotenv = require('dotenv');
if (process.env["NODE_ENV"] !== 'production') {
  dotenv.config();
}

const fs = require('fs');

const configuration = require('./src/models/configuration');

let lang = fs.readFileSync(__dirname + "\\src\\config\\lang\\spanish.json");
let selected_lang = JSON.parse(lang);

const express = require("express");
const expbs = require("express-handlebars");
const db = require('./src/data/connection');
const { log } = require('console');
const app = express();
const hbs = expbs.create({
  extname: ".hbs",
  helpers: {
    eachListHighlights: eachListHighlights,
    renderSettingsTemplate:renderSettingsTemplate
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

function renderSettingsTemplate(dataConfig){
  let row1 = '';
  let row2 = '';
  let row3 = '';
  let row4 = '';

  row1 +=`<div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3 g-4 pt-5">
  <div class="col d-flex align-items-start">
    <i class="fad fa-database flex-shrink-0 me-3" style="font-size: 1.75em;"></i>
    <div>
      <h5 class="mb-0">KoboReader.sqlite</h5>`;

  if (dataConfig.dbKoboReader.enabled) {
    row1 += `<p><i class="fad fa-circle pe-1 enabled"></i>Habilitado</p>`;
  } else {
    row1 += `<p><i class="fad fa-circle pe-1 disabled"></i>Deshabilitado</p>`;
  }

  row1 +=`   </div>
  </div>
  <div class="col d-flex align-items-start">
    <span class="iconify flex-shrink-0 me-3" style="font-size: 1.75em;" data-icon="simple-icons:notion"></span>
    <div>
      <h5 class="mb-0">API Notion</h5>`;

  if (dataConfig.notionAPI.enabled) {
    row1 += `<p><i class="fad fa-circle pe-1 enabled"></i>Habilitado</p>`;
  } else {
    row1 += `<p><i class="fad fa-circle pe-1 disabled"></i>Deshabilitado</p>`;
  }

  row1 +=`   </div>
  </div>
  <div class="col d-flex align-items-start">
    <i class="fad fa-server flex-shrink-0 me-3" style="font-size: 1.75em;"></i>
    <div>
      <h5 class="mb-0">Backup</h5>`;

  if (dataConfig.backup.enabled) {
    row1 += `<p><i class="fad fa-circle pe-1 enabled"></i>Habilitado</p>`;
  } else {
    row1 += `<p><i class="fad fa-circle pe-1 disabled"></i>Deshabilitado</p>`;
  }

  row1 +=`    </div>
    </div>
  </div>`;

  row2 +=`    <div class="row">
  <div class="col-12 pt-4">
    <p class="h5">General</p>
    <hr>
    <div class="mb-3 row align-items-center">
      <div class="col-sm-12 col-xxl-6 d-flex gap-3">
        <div class="pt-1">
            <i class="fad fa-globe" style="font-size: 32px;"></i>
        </div>
        <div class="d-flex gap-2 w-100 justify-content-between">
          <div class="d-flex gap-2 w-100 justify-content-between">
            <div>
              <h6 class="mb-0">Lenguaje</h6>
              <p class="mb-0 opacity-75">Cambia el idioma de la aplicación</p>
            </div>

          </div>
        </div>
      </div>
      <div class="col-sm-12 col-xxl-6">
        <select class="form-select form-select-sm" aria-label=".form-select-sm example">`;

    for (let index = 0; index < selected_lang.settings.language.length; index++) {
      // console.log(selected_lang.settings.language[index]);
      
      //console.log(dataConfig.language);
      
      // row2 +=`<option value="${selected_lang.settings.language[index].prefix}">${selected_lang.settings.language[index].lang}</option>`;
      
      if (selected_lang.settings.language[index].prefix != dataConfig.language) {
        row2 +=`<option value="${selected_lang.settings.language[index].prefix}">${selected_lang.settings.language[index].lang}</option>`;
      } else {
        row2 +=`<option selected value="${selected_lang.settings.language[index].prefix}">${selected_lang.settings.language[index].lang}</option>`;
      }
    }
  
  row2 +=`            </select>
  </div>
</div>
<div class="mb-3 row">
  <div class="col-sm-12 col-xxl-6 d-flex gap-3">
    <div class="pt-1">
        <i class="fad fa-bookmark" style="font-size: 32px;"></i>
    </div>
    <div class="d-flex gap-2 w-100 justify-content-between">
      <div class="d-flex gap-2 w-100 justify-content-between">
        <div>
          <h6 class="mb-0">Tipos de marcadores</h6>
          <p class="mb-0 opacity-75">Habilita los marcadores que deseas ver</p>
        </div>

      </div>
    </div>
  </div>`;


  if (dataConfig.bookmarks[0].active) {
    row3 += `<div class="col-sm-6 col-xxl-3"><div class="form-check form-switch">
    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" checked>
    <label class="form-check-label" for="flexSwitchCheckDefault"><i class="fad fa-pencil pe-1"></i>Anotaciones</label>
  </div>`;
  } else {
    row3 += `<div class="col-sm-6 col-xxl-3"><div class="form-check form-switch">
      <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
      <label class="form-check-label" for="flexSwitchCheckDefault"><i class="fad fa-pencil pe-1"></i>Anotaciones</label>
    </div>`;
  }

  if (dataConfig.bookmarks[1].active) {
    row3 += `  <div class="form-check form-switch">
  <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" checked>
  <label class="form-check-label" for="flexSwitchCheckDefault"><i class="fad fa-highlighter pe-1"></i>Subrayados</label>
</div>`;
  } else {
    row3 += `  <div class="form-check form-switch">
  <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
  <label class="form-check-label" for="flexSwitchCheckDefault"><i class="fad fa-highlighter pe-1"></i>Subrayados</label>
</div>`;
  }

  if (dataConfig.bookmarks[2].active) {
    row3 +=`<div class="form-check form-switch">
  <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" checked>
  <label class="form-check-label" for="flexSwitchCheckDefault"><i class="fad fa-quote-right pe-1"></i>Citas</label>
</div>`;
  } else {
    row3 +=`<div class="form-check form-switch">
  <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
  <label class="form-check-label" for="flexSwitchCheckDefault"><i class="fad fa-quote-right pe-1"></i>Citas</label>
</div>`;
  }

  if (dataConfig.bookmarks[3].active) {
    row3 +=`<div class="form-check form-switch">
  <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" checked>
  <label class="form-check-label" for="flexSwitchCheckDefault"><i class="fad fa-book pe-1"></i>Vocabulario</label>
</div>
</div>`;
  } else {
    row3 +=`<div class="form-check form-switch">
  <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" >
  <label class="form-check-label" for="flexSwitchCheckDefault"><i class="fad fa-book pe-1"></i>Vocabulario</label>
</div>
</div>`;
  }

  if (dataConfig.bookmarks[4].active) {
    row3 += `  <div class="col-sm-6 col-xxl-3"><div class="form-check form-switch">
    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" checked>
    <label class="form-check-label" for="flexSwitchCheckDefault"><i class="fad fa-graduation-cap pe-1"></i>Definiciones</label>
  </div>`;
  } else {
    row3 += `  <div class="col-sm-6 col-xxl-3"><div class="form-check form-switch">
    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
    <label class="form-check-label" for="flexSwitchCheckDefault"><i class="fad fa-graduation-cap pe-1"></i>Definiciones</label>
  </div>`;

  }

  if (dataConfig.bookmarks[5].active) {
    row3 += `  <div class="form-check form-switch">
    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" checked>
    <label class="form-check-label" for="flexSwitchCheckDefault"><i class="fad fa-font pe-1"></i>Palabras</label>
  </div>`;
  } else {
    row3 += `  <div class="form-check form-switch">
    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
    <label class="form-check-label" for="flexSwitchCheckDefault"><i class="fad fa-font pe-1"></i>Palabras</label>
  </div>`;
  }

  if (dataConfig.bookmarks[6].active) {
    row3 += `  <div class="form-check form-switch">
    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" checked>
    <label class="form-check-label" for="flexSwitchCheckDefault"><i class="fad fa-bookmark pe-1"></i>Marcadores</label>
  </div>
</div>
</div>`;
  } else {
    row3 += `  <div class="form-check form-switch">
    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
    <label class="form-check-label" for="flexSwitchCheckDefault"><i class="fad fa-bookmark pe-1"></i>Marcadores</label>
  </div>
</div>
</div>`;
  }

  row4 += `        <div class="mb-3 row align-items-center">
  <div class="col-sm-12 col-xxl-6 d-flex gap-3">
    <div class="pt-1">
        <i class="fad fa-book" style="font-size: 32px;"></i>
    </div>
    <div class="d-flex gap-2 w-100 justify-content-between">
      <div class="d-flex gap-2 w-100 justify-content-between">
        <div>
          <h6 class="mb-0">Diccionario</h6>
          <p class="mb-0 opacity-75">Cambia el URL de tu diccionario</p>
        </div>

      </div>
    </div>
  </div>
  <div class="col-sm-12 col-xxl-6">
    <div class="input-group input-group-sm">
      <span class="input-group-text text-muted" id="inputGroup-sizing-sm">https://</span>`;
  
      if (dataConfig.dictionaryURL == '') {
        row4 += `<input type="text" class="form-control" placeholder="dle.rae.es/" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">`;
      } else {
        row4 += `<input type="text" class="form-control" placeholder="dle.rae.es/" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value="${dataConfig.dictionaryURL}">`;
      }


  row4 += `</div>
  </div>
</div>
<div class="mb-3 row align-items-center">
  <div class="col-sm-12 col-xxl-6 d-flex gap-3">
    <div class="pt-1">
        <i class="fad fa-search" style="font-size: 32px;"></i>
    </div>
    <div class="d-flex gap-2 w-100 justify-content-between">
      <div class="d-flex gap-2 w-100 justify-content-between">
        <div>
          <h6 class="mb-0">Buscador</h6>
          <p class="mb-0 opacity-75">Cambia el URL de tu buscador favorito</p>
        </div>

      </div>
    </div>
  </div>
  <div class="col-sm-12 col-xxl-6">
    <div class="input-group input-group-sm">
      <span class="input-group-text text-muted" id="inputGroup-sizing-sm">https://</span>`;
  
  if (dataConfig.searchURL == '') {
    row4 += `<input type="text" class="form-control" placeholder="www.google.com/search?q=" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">`;
  } else {
    row4 += `<input type="text" class="form-control" placeholder="www.google.com/search?q=" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value="${dataConfig.searchURL}">`;
  }

  row4 += `</div>
    </div>
  </div>
  </div>
  </div>`;
  return row1 + row2 + row3 + row4;
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
  res.render("bookmarks", {layout:'lay_bookmarks',titulo: "Resaltados", lang:selected_lang, book: book_data, highlights:highlights_data, bookAnterior: book_anterior, bookNext:book_next, bookTitleAnterior:book_title_anterior,bookTitleNext:book_title_next});
  //res.render("resaltados", {titulo: "Resaltados", book: book_data, highlights:highlights_data});
});

app.get("/settings",async (req,res) => {
  // configuration.create();

  let update_settings = {
      "dbKoboReader":{
        "title":"KoboReader.sqlite",
        "enabled":false
      },
      "notionAPI":{
        "enabled":false
      },
      "backup":{
        "enabled":false
      },
      "language" : "es",
      "bookmarks":[
        {"type":"notes","active":false},
        {"type":"highlights","active":true},
        {"type":"quotes","active":true},
        {"type":"vocabulary","active":true},
        {"type":"definitions","active":false},
        {"type":"words","active":true},
        {"type":"dogears","active":false}
      ],
      "dictionaryURL":"texto",
      "searchURL":"actualizado"
  };
  configuration.update(update_settings);
  let settings_local = configuration.read();
  // console.log(configuration.read());

  res.render("settings", {layout:'lay_settings', titulo: "Configuración", dataConfig:settings_local});
});

app.listen(5100, () => console.log("Server running..."));