const configuration = require('../models/configuration');

exports.fetch = (req, res) => {
  res.json({"data":"lista","status":"ok","message": "lista configuracion"});
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