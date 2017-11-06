const serverless = require('serverless-http');
const express = require('express');
const superagent = require('superagent');

const configLoader = require('./config/service');
const smmtConfig = require('./config/smmt').load();
const smmtClient = require('./smmt/client').create(superagent, smmtConfig);
const loggerFactory = require('./logger/createLogger');

let logger = loggerFactory.create();

const app = express();
app.disable('x-powered-by');

app.get('/recalls', (req, res) => {
  logger.debug(req, 'Received request.');

  const { make, vin } = req.query;

  if (make && vin) {
    smmtClient.vincheck(make, vin)
      .then((recall) => {
        if (recall.success) {
          logger.info({ context: { make, vin, recall } }, 'Recall fetched successfully.');
          res.status(200)
            .send({
              status_description: recall.description,
              vin_recall_status: recall.status,
              last_update: recall.lastUpdate,
            });
        } else {
          const context = {
            make, vin, errors: recall.errors,
          };
          logger.error({ context }, 'Recall fetching from SMMT failed.');
          res.status(403).send({
            errors: recall.errors,
          });
        }
      }).catch((error) => {
        const context = {
          make, vin, errors: [error],
        };
        logger.error({ context }, 'SMMT communication issue.');
        res.status(500)
          .send({
            errors: context.errors,
          });
      });
  } else {
    const context = {
      make, vin, errors: ['Make and vin query parameters are required'],
    };
    logger.error({ context }, 'Invalid request.');
    res.status(400).send({
      errors: context.errors,
    });
  }
});

exports.app = app;
exports.handler = serverless(app, {
  request: (item, event, context) => {
    configLoader.functionName = context.functionName;
    configLoader.functionVersion = context.functionVersion;
    logger = loggerFactory.create();

    return item;
  },
});
