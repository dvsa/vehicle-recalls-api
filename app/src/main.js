const serverless = require('serverless-http');
const express = require('express');
const morgan = require('morgan');
const morganJson = require('morgan-json');

const smmtClient = require('./smmt/client');
const config = require('./config/loader').load();

const app = express();
app.disable('x-powered-by');

const logFormat = morganJson(':method :url :status :res[content-length] bytes :response-time ms');
app.use(morgan(logFormat));

app.get('/recalls', (req, res) => {
  const { marque, vin } = req.query;

  if (marque && vin) {
    const result = smmtClient.vincheck(marque, vin, () => {}, config);
    
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
    });
  } else {
    res.status(400).send();
  }
});

exports.app = app;
exports.handler = serverless(app);
