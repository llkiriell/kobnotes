const dotenv = require('dotenv');
if (process.env["NODE_ENV"] !== 'production') {
  dotenv.config();
}

const express = require("express");
const expbs = require("express-handlebars");
const app = express();
const configDB = require('./src/data/configDB');
const __PORT__ = process.env["PORT"] || 5100;

const fs = require('fs');
let lang = fs.readFileSync(".\\src\\config\\lang\\spanish.json");
let selected_lang = JSON.parse(lang);

const apiV1Router = require("./src/routes/api-v1");
const library = require("./src/routes/library");
const libraries = require("./src/routes/libraries");
const settings = require("./src/routes/settings");

const hbs = expbs.create({
  extname: ".hbs"
});

app.use(express.static(__dirname + "/public/views"));
app.use('/static',express.static(__dirname + "/public/assets"));

app.set("view engine", ".hbs");
app.engine(".hbs", hbs.engine);
app.set("views", "./public/views");

// Inicializar la base de datos de configuración
const configDBConn = configDB.getConnection();
const config = configDB.getConfig(); // Esto creará una configuración por defecto si no existe

//Routes
app.use("/api/v1", apiV1Router);
// app.use("/libraries", library);
app.use("/libraries", libraries);
app.use("/settings",settings);

app.get("/dataload",(req,res) => {
  res.render('dataload',{title:'Cargar base de datos'});
});

app.get("/webhook",(req,res) => {
  // Verificar si hay una librería activa
  const activeLibrary = configDB.getActiveLibrary();
  if (activeLibrary) {
    res.redirect("/libraries");
  } else {
    res.redirect("/dataload");
  }
});

// Ruta principal
app.get("/", (req, res) => {
  res.redirect("/webhook");
});

app.listen(__PORT__, () => {
  console.log(`[ OK ] server running localhost:${__PORT__}`);
  console.log(`[ OK ] Configuration database initialized`);
});