const responseCode = require('./responseCode').code;
const logger = require('lambda-log');

let restClient;
let config;

function isVinNumberCorrect(vin) {
  const minVinLength = 5;
  if (vin && vin.length >= minVinLength) {
    return true;
  }

  logger.debug('Incorrect vin.', { context: { vin } });
  return false;
}

function isMarqueCorrect(marque) {
  const minMarqueLength = 2;
  if (marque && marque.length >= minMarqueLength) {
    return true;
  }

  logger.debug('Incorrect marque.', { context: { marque } });
  return false;
}

function generateRecallResponse(recall) {
  const result = {
    success: false,
    errors: [],
    description: '',
    status: '',
    lastUpdate: '',
  };

  switch (recall.status) {
    case responseCode.smmtInvalidApiKey:
      logger.debug('Invalid SMMT api key.', { context: { recall } });
      result.errors.push(recall.status_description);
      break;
    case responseCode.smmtInvalidMarque:
      logger.debug('Invalid SMMT marque.', { context: { recall } });
      result.errors.push(recall.status_description);
      break;
    case responseCode.smmtNoRecall:
      logger.debug('No recall found.', { context: { recall } });
      result.success = true;
      break;
    case responseCode.smmtRecall:
      logger.debug('Recall found.', { context: { recall } });
      result.success = true;
      break;
    default:
      logger.debug('Unknown SMMT response', { context: { recall } });
      result.errors.push(`Unknown SMMT code: ${recall.status}`);
      result.errors.push(recall.status_description);
      break;
  }

  result.description = recall.status_description;
  result.status = recall.vin_recall_status;
  result.lastUpdate = recall.last_update;

  return result;
}

function getSmmtResponseSuperagent(marque, vin) {
  return restClient
    .post(config.smmtVincheckUri)
    .type('json')
    .send({
      apikey: config.smmtApiKey,
      vin,
      marque,
    })
    .then(response => generateRecallResponse(response.body));
}

function vincheck(marque, vin) {
  const errors = [];
  let validVin = true;
  let validMarque = true;

  if (!isVinNumberCorrect(vin)) {
    errors.push('Invalid VIN');
    validVin = false;
  }

  if (!isMarqueCorrect(marque)) {
    errors.push('Invalid Marque');
    validMarque = false;
  }

  if (validVin && validMarque) {
    return getSmmtResponseSuperagent(marque, vin);
  }

  return Promise.resolve({ success: false, errors });
}

exports.create = (restClientImplementation, smmtConfig) => {
  if (!restClientImplementation || !smmtConfig) {
    return new Error('SMMT client arguments are missing.');
  }

  restClient = restClientImplementation;
  config = smmtConfig;

  return { vincheck };
};
