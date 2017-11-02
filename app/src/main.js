const serverless = require('serverless-http');
const express = require('express');
const morgan = require('morgan');
const superagent = require('superagent');

const smmtConfig = require('./config/smmt').load();
const smmtClient = require('./smmt/client').create(superagent, smmtConfig);
const serviceConfig = require('./config/service').load();
const requestLoggerConfig = require('./config/logger/requests');

const app = express();
app.disable('x-powered-by');
app.use(morgan(requestLoggerConfig(serviceConfig)));

const logger = require('lambda-log');

logger.config.debug = serviceConfig.isDebug;
logger.config.silent = serviceConfig.isLoggerSilent;
logger.config.meta.component = serviceConfig.name;
logger.config.meta.env = serviceConfig.env;
logger.config.tags.push(serviceConfig.functionName);
logger.config.tags.push(serviceConfig.functionVersion);

app.get('/recalls', (req, res) => {
  logger.debug('Service config', { context: { serviceConfig } });

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
        const context = {
          recall, make, vin, errors: recall.errors,
        };
        logger.warn('Recall fetching from SMMT failed.', { context });
        res.status(403).send({
          errors: recall.errors,
        });
      }
    }).catch((error) => {
      const context = {
        make, vin, errors: [error],
      };
      logger.warn('SMMT communication issue.', { context });
      res.status(500)
        .send({
          errors: context.errors,
        });
    });
  } else {
    const context = {
      make, vin, errors: ['Make and vin query parameters are required'],
    };
    logger.warn('Recall fetching from SMMT failed.', { context });
    res.status(400).send({
      errors: context.errors,
    });
  }
});

exports.app = app;
exports.handler = serverless(app);
