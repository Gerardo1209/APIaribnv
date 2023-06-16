/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const express = require("express"); //importar express
const bodyParser = require("body-parser");
const misRutas = require("./routes/rutas");
const app = express(); //crear al servidor
const cors = require("cors");
const port = 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/", misRutas);

app.listen(port, (err, res) => {
  if (err) {
    logger.info("Error al levantar servidor");
    return;
  }
  logger.info("Apis escuchando en el puerto " + port);
});

//module.exports = this.app;
exports.api = onRequest(app);
// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
