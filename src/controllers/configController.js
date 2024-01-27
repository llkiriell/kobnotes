const config = require('../models/config');

exports.getConfigs = (req, res) => {
  let configs = config.list();
  res.json(configs);
};

exports.addConfig = (req, res) => {
  let conf = req.body;
  let rpt = config.create(conf);
  res.json(rpt);
};

exports.updateConfig = (req, res) => {
  let up_conf = req.body;
  let rpt = config.update(up_conf);
  res.json(rpt);
};

exports.deleteConfig = (req, res) => {
  let id = req.params.idConfig;
  let rpt = config.delete(id);
  res.json(rpt);
};

exports.findConfigs = (req, res) => {
  let id = req.params.idConfig;
  let rpt = config.findId(id);
  res.json(rpt);
};

exports.show = (req, res) => {
  const idConfig = req.params.libraryId;
  let libconf = config.findId(idConfig);

  let select_langs = `
  <option value="en">English</option>
  <option value="es">Español</option>`;

  switch (libconf.data.lang) {
    case "en":
      select_langs = select_langs.replace('value="en"', 'value="en" selected');
      break;
    case "es":
      select_langs = select_langs.replace('value="es"', 'value="es" selected');
      break;
    default:
      select_langs = select_langs.replace('value="en"', 'value="en" selected');
      break;
  }

  let swtiches_panel = `
  <div class="form-check form-switch py-1">
    <input class="form-check-input" type="checkbox" role="switch" id="switch_notes">
    <label class="form-check-label ps-2" for="switch_notes"><i class="fad fa-pencil pe-1"></i>Anotaciones</label>
  </div>  
  <div class="form-check form-switch py-1">
    <input class="form-check-input" type="checkbox" role="switch" id="switch_hightlights">
    <label class="form-check-label ps-2" for="switch_hightlights"><i class="fad fa-highlighter pe-1"></i>Subrayados</label>
  </div>
  <div class="form-check form-switch py-1">
    <input class="form-check-input" type="checkbox" role="switch" id="switch_quotes">
    <label class="form-check-label ps-2" for="switch_quotes"><i class="fad fa-quote-right pe-1"></i>Citas</label>
  </div>
  <div class="form-check form-switch py-1">
    <input class="form-check-input" type="checkbox" role="switch" id="switch_vocabulary">
    <label class="form-check-label ps-2" for="switch_vocabulary"><i class="fad fa-book pe-1"></i>Vocabulario</label>
  </div>
  <div class="form-check form-switch py-1">
    <input class="form-check-input" type="checkbox" role="switch" id="switch_definitions">
    <label class="form-check-label ps-2" for="switch_definitions"><i class="fad fa-graduation-cap pe-1"></i>Definiciones</label>
  </div>
  <div class="form-check form-switch py-1">
    <input class="form-check-input" type="checkbox" role="switch" id="switch_words">
    <label class="form-check-label ps-2" for="switch_words"><i class="fad fa-font pe-1"></i>Palabras</label>
  </div>
  <div class="form-check form-switch py-1">
    <input class="form-check-input" type="checkbox" role="switch" id="switch_dogears">
    <label class="form-check-label ps-2" for="switch_dogears"><i class="fad fa-bookmark pe-1"></i>Marcadores</label>
  </div>`;

  if (libconf.data.enable_notes == 1) {
    swtiches_panel = swtiches_panel.replace('id="switch_notes"', 'id="switch_notes" checked');
  }
  if (libconf.data.enable_highlights == 1) {
    swtiches_panel = swtiches_panel.replace('id="switch_hightlights"', 'id="switch_hightlights" checked');
  }
  if (libconf.data.enable_quotes == 1) {
    swtiches_panel = swtiches_panel.replace('id="switch_quotes"', 'id="switch_quotes" checked');
  }
  if (libconf.data.enable_vocabulary == 1) {
    swtiches_panel = swtiches_panel.replace('id="switch_vocabulary"', 'id="switch_vocabulary" checked');
  }
  if (libconf.data.enable_definitions == 1) {
    swtiches_panel = swtiches_panel.replace('id="switch_definitions"', 'id="switch_definitions" checked');
  }
  if (libconf.data.enable_words == 1) {
    swtiches_panel = swtiches_panel.replace('id="switch_words"', 'id="switch_words" checked');
  }
  if (libconf.data.enable_dogears == 1) {
    swtiches_panel = swtiches_panel.replace('id="switch_dogears"', 'id="switch_dogears" checked');
  }



  //res.render("settings", { layout: 'lay_settings', helpers: { eachSettings: renderSettingsTemplate }, titulo: "Configuración", dataConfig: config_local });
  res.render("settings", {layout: 'lay_settings', titulo: "Configuración", libConf:libconf.data, libraryId:idConfig, selectLangs:select_langs, swtichesPanel:swtiches_panel});
};