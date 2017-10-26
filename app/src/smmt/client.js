const responseCode = require('./responseCode').code;

let restClient;
let config;

function isVinNumberCorrect(vin) {
  const minVinLength = 5;
  if (vin && vin.length >= minVinLength) {
    return true;
  }
  return false;
}

function isMarqueCorrect(marque) {
  const minMarqueLength = 2;
  if (marque && marque.length >= minMarqueLength) {
    return true;
  }
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
      result.success = false;
      result.errors.push(recall.status_description);
      break;
    case responseCode.smmtInvalidMarque:
      result.success = false;
      result.errors.push(recall.status_description);
      break;
    case responseCode.smmtNoRecall:
      result.success = true;
      break;
    case responseCode.smmtRecall:
      result.success = true;
      break;
    default:
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
