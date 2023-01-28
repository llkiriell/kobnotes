const express = require("express");
const expbs = require("express-handlebars");

const fs = require('fs');
const app = express();

app.listen(5100, () => console.log("Server running..."));