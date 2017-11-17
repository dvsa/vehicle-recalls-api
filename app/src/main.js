const co = require('co');
const serverless = require('serverless-http');
const express = require('express');
const superagent = require('superagent');

const serviceConfig = require('./config/service');
const smmtConfigLoader = require('./config/smmtConfigurationLoader');
const smmtClientFactory = require('./smmt/client');
const loggerFactory = require('./logger/createLogger');

let logger = loggerFactory.create();

const app = express();
app.disable('x-powered-by');

const traceHeaderName = 'x-moth-trace-id';
let traceId;

function* fetchRecall(make, vin, res) {
  const smmtConfig = yield smmtConfigLoader.load();

  smmtClientFactory.create(superagent, smmtConfig).vincheck(make, vin)
    .then((recall) => {
      if (recall.success) {
        logger.info({ context: { make, vin, recall }, traceId }, 'Recall fetched successfully.');
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
        logger.error({ context, traceId }, 'Recall fetching from SMMT failed.');
        res.status(403).send({
          errors: recall.errors,
        });
      }
    }).catch((error) => {
      const context = {
        make, vin, errors: [error],
      };
      logger.error({ context, traceId }, 'SMMT communication issue.');
      res.status(500)
        .send({
          errors: context.errors,
        });
    });
}

app.get('/recalls', (req, res) => {
  logger.debug({ context: req, traceId }, 'Received request.');
  const { make, vin } = req.query;
  traceId = req.headers[traceHeaderName];

  if (make && vin) {
    co(fetchRecall(make, vin, res));
  } else {
    const context = {
      make, vin, errors: ['Make and vin query parameters are required'],
    };
    logger.error({ context, traceId }, 'Invalid request.');
    res.status(400).send({
      errors: context.errors,
    });
  }
});

exports.app = app;
exports.handler = serverless(app, {
  request: (item, event, context) => {
    logger.debug({
      item,
      event,
      context,
      traceId,
    }, 'Function request handler');

    serviceConfig.functionName = context.functionName;
    serviceConfig.functionVersion = context.functionVersion;
    logger = loggerFactory.create();

    return item;
  },
});
