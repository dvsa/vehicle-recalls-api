const serverless = require('serverless-http');
const express = require('express');
const morgan = require('morgan');
const morganJson = require('morgan-json');
const superagent = require('superagent');

const config = require('./config/loader').load();
const smmtClient = require('./smmt/client').create(superagent, config);

const app = express();
app.disable('x-powered-by');

const logFormat = morganJson(':method :url :status :res[content-length] bytes :response-time ms');
app.use(morgan(logFormat));

app.get('/recalls', (req, res) => {
  const { make, vin } = req.query;

  if (make && vin) {
    const result = smmtClient.vincheck(make, vin);

    result.then((recall) => {
      if (recall.success) {
        res.status(200)
          .send({
            status_description: recall.description,
            vin_recall_status: recall.status,
            last_update: recall.lastUpdate,
          });
      } else {
        res.status(403).send({
          errors: recall.errors,
        });
      }
    }).catch((error) => {
      res.status(418)
        .send({
          errors: [error],
        });
    });
  } else {
    res.status(400).send();
  }
});

exports.app = app;
exports.handler = serverless(app);