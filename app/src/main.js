const serverless = require('serverless-http');
const express = require('express');
var morgan = require('morgan');
const morganJson = require('morgan-json');

const app = express();
app.disable('x-powered-by');

const logFormat = morganJson(':method :url :status :res[content-length] bytes :response-time ms');
app.use(morgan(logFormat));

app.get('/', (req, res) => {
  
  res.status(200).send({
    status_description: 'Recall Outstanding',
    vin_recall_status: 'BRAKES',
    last_update: '19022015',
  });
});

exports.app = app;
exports.handler = serverless(app);