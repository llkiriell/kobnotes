const configuration = require('../models/configuration');

exports.show = (req, res) => {
  let config_local = configuration.read().data;
  res.render("settings", {layout:'lay_settings', titulo: "Configuración", dataConfig:config_local});
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
  console.log(req.file);

  let res_return = configuration.create();
  res_return.data.filename = req.file.filename;

  console.log(res_return);

  let rpta = {"resreturn": res_return, "status":"ok","message":"archivo subido correctamente"};
  res.json(rpta);
};