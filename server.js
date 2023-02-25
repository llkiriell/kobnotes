const dotenv = require('dotenv');
if (process.env["NODE_ENV"] !== 'production') {
  dotenv.config();
}

const express = require("express");
const expbs = require("express-handlebars");
const app = express();
const configuration = require('./src/models/configuration');
const __PORT__ = process.env["NODE_ENV"] || 5100;

const fs = require('fs');
let lang = fs.readFileSync(".\\src\\config\\lang\\spanish.json");
let selected_lang = JSON.parse(lang);

const apiV1Router = require("./src/routes/api-v1");
const library = require("./src/routes/library");
const settings = require("./src/routes/settings");

const hbs = expbs.create({
  extname: ".hbs"
});

app.use(express.static(__dirname + "/public/views"));
app.use(express.static(__dirname + "/public/assets"));

app.set("view engine", ".hbs");
app.engine(".hbs", hbs.engine);
app.set("views", "./public/views");

//Routes
app.use("/api/v1", apiV1Router);
app.use("/libraries", library);
app.use("/settings",settings);

app.get("/dataload",(req,res) => {
  res.render('dataload',{title:'Cargar base de datos'});
});

app.get("/",(req,res) => {
  if (configuration.exists()) {
    res.redirect("/libraries/books");
  } else {
    res.redirect("/dataload");
  }
});

app.listen(__PORT__, () => console.log(`[ OK ] server running localhost:${__PORT__}`));