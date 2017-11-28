const responseCode = require('./responseCode');

let restClient;
let config;
let logger;

function isVinNumberCorrect(vin) {
  const minVinLength = 5;
  if (vin && vin.length >= minVinLength) {
    return true;
  }

  logger.debug({ context: { vin } }, 'Incorrect vin.');
  return false;
}

function isMarqueCorrect(marque) {
  const minMarqueLength = 2;
  if (marque && marque.length >= minMarqueLength) {
    return true;
  }

  logger.debug({ context: { marque } }, 'Incorrect marque.');
  return false;
}

function generateRecallResponse(recall) {
  const result = {
    success: false,
    errors: [],
    description: '',
    status: '',
    lastUpdate: '',
    actionCode: '',
  };

  switch (recall.status) {
    case responseCode.smmtInvalidApiKey:
      logger.error({ context: { recall } }, 'Invalid SMMT api key.');
      result.errors.push(recall.status_description);
      break;
    case responseCode.smmtInvalidMarque:
      logger.error({ context: { recall } }, 'Invalid SMMT marque.');
      result.errors.push(recall.status_description);
      break;
    case responseCode.smmtInvalidVin:
      logger.error({ context: { recall } }, 'Invalid SMMT vin.');
      result.errors.push(recall.status_description);
      break;
    case responseCode.smmtNoRecall:
      logger.debug({ context: { recall } }, 'No recall found.');
      result.success = true;
      break;
    case responseCode.smmtRecall:
      logger.debug({ context: { recall } }, 'Recall found.');
      result.success = true;
      break;
    default:
      logger.error({ context: { recall } }, 'Unknown SMMT response');
      result.errors.push(`Unknown SMMT code: ${recall.status}`);
      result.errors.push(recall.status_description);
      break;
  }

  result.description = recall.status_description;
  result.status = recall.vin_recall_status;
  result.lastUpdate = recall.last_update;
  result.actionCode = recall.status;

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

exports.create = (restClientImplementation, smmtConfig, applicationLogger) => {
  if (!restClientImplementation || !smmtConfig) {
    return new Error('SMMT client arguments are missing.');
  }

  if (!applicationLogger) {
    return new Error('External dependence "Logger" is missing.');
  }

  restClient = restClientImplementation;
  config = smmtConfig;
  logger = applicationLogger;

  return { vincheck };
};
