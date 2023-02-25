const configuration = require('../models/configuration');
const fs = require('fs');
let lang = fs.readFileSync(".\\src\\config\\lang\\spanish.json");
let selected_lang = JSON.parse(lang);

exports.show = (req, res) => {
  let config_local = configuration.read().data;
  res.render("settings", { layout: 'lay_settings', helpers: { eachSettings: renderSettingsTemplate }, titulo: "Configuración", dataConfig: config_local });
};

exports.fetch = (req, res) => {
  let config_local = configuration.read().data;
  let rpta = {"data":config_local, "status":"ok","message":"Configuración local"};
  res.json(rpta);
};

exports.create = (req, res) => {
  let cuerpo = req.body;
  let rpta = {"data":cuerpo, "status":"ok","message":"Crear configuración"};
  res.json(rpta);
};

exports.update = (req, res) => {
  let config_put = req.body;
  configuration.update(config_put);

  let rpta = {"data":config_put,"status":"ok","message":"Actualizar configuración"};
  res.json(rpta);
};

exports.delete = (req, res) => {
  let parametros = req.query;
  let rpta = {"data":parametros, "status":"ok","message":"Borrar configuración"};
  res.json(rpta);
};

exports.uploadDatabase = (req, res) => {
  let res_return = configuration.create();
  res_return.data.filename = req.file.filename;

  let rpta = {"resreturn": res_return, "status":"ok","message":"archivo subido correctamente"};
  res.json(rpta);
};

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