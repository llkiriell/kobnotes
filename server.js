const express = require("express");
const expbs = require("express-handlebars");

const app = express();

const apiV1Router = require("./src/routes/api-v1");

//API routes
app.use("/api/v1", apiV1Router);

app.get("/",(req,res) => {
    res.send('inicio general de la aplicacion');
});


app.listen(5000, () => console.log("Server running..."));