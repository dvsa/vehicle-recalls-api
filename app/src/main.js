const co = require('co');
const serverless = require('serverless-http');
const express = require('express');
const superagent = require('superagent');

const serviceConfig = require('./config/service');
const smmtConfigLoader = require('./config/smmtConfigurationLoader');
const smmtClientFactory = require('./smmt/client');
const loggerFactory = require('./logger/createLogger');
const responseCode = require('./smmt/responseCode');
const responseEvent = require('./event/responseEvent');

const app = express();
app.disable('x-powered-by');
const traceHeaderName = 'x-mot-trace-id';

function processSmmtResponse(make, vin, recall, res, logger) {
  if (recall.success) {
    logger.info({
      context: {
        make, vin, recall, event: responseEvent.SUCCESS,
      },
    }, 'Recall fetched successfully.');

    res.status(200)
      .send({
        status_description: recall.description,
        vin_recall_status: recall.status,
        last_update: recall.lastUpdate,
      });
  } else if (recall.actionCode === responseCode.smmtInvalidMarque) {
    const context = {
      make, vin, errors: recall.errors, event: responseEvent.SMMT_FAILURE,
    };
    logger.error({ context }, 'Recall fetching from SMMT failed. Invalid make.');

    res.status(422).send({
      errors: recall.errors,
    });
  } else if (recall.actionCode === responseCode.smmtInvalidVin) {
    const context = {
      make, vin, errors: recall.errors, event: responseEvent.SMMT_FAILURE,
    };
    logger.error({ context }, 'Recall fetching from SMMT failed. Invalid VIN.');

    res.status(422).send({
      errors: recall.errors,
    });
  } else {
    const context = {
      make, vin, errors: recall.errors, event: responseEvent.SMMT_FAILURE,
    };
    logger.error({ context }, 'Recall fetching from SMMT failed.');

    res.status(403).send({
      errors: recall.errors,
    });
  }
}

function* fetchRecall(make, vin, res, logger) {
  const smmtConfig = yield smmtConfigLoader.load(logger);

  smmtClientFactory.create(superagent, smmtConfig, logger).vincheck(make, vin)
    .then((recall) => {
      processSmmtResponse(make, vin, recall, res, logger);
    }).catch((error) => {
      const context = {
        make, vin, errors: [error], event: responseEvent.FAILURE,
      };
      logger.error({ context }, 'Recall fetching from SMMT failed. SMMT communication issue.');

      res.status(500)
        .send({
          errors: context.errors,
        });
    });
}

app.get('/recalls', (req, res) => {
  const logger = loggerFactory.create(req.headers[traceHeaderName]);
  logger.debug({ context: req }, 'Received request.');

  const { make, vin } = req.query;

  if (make && vin) {
    co(fetchRecall(make, vin, res, logger));
  } else {
    const context = {
      make, vin, errors: ['Make and vin query parameters are required'], event: responseEvent.FAILURE,
    };
    logger.error({ context }, 'Recall fetching from SMMT failed. Invalid request.');

    res.status(400).send({
      errors: context.errors,
    });
  }
});

exports.app = app;
exports.handler = serverless(app, {
  request: (item, event, context) => {
    serviceConfig.functionName = context.functionName;
    serviceConfig.functionVersion = context.functionVersion;

    return item;
  },
});
