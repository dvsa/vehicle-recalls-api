const serverless = require('serverless-http');
const express = require('express');
const morgan = require('morgan');
const morganJson = require('morgan-json');

let smmtClient = require('./smmt/client');

const app = express();
app.disable('x-powered-by');

const logFormat = morganJson(':method :url :status :res[content-length] bytes :response-time ms');
app.use(morgan(logFormat));

app.get('/recalls', (req, res) => {
  const { marque, vin } = req.query;

  if (marque && vin) {
    const recall = smmtClient.vincheck(marque, vin);

    if (recall.success) {
      res.status(200)
        .send({
          status_description: recall.description,
          vin_recall_status: recall.status,
          last_update: recall.last_update,
        });
    } else {
      res.status(403).send({
        errors: recall.errors,
      });
    }
  } else {
    res.status(400).send();
  }
});

exports.app = (client) => {
  smmtClient = client;

  return app;
};

exports.handler = serverless(app);
