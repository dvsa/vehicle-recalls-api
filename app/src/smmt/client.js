const request = require('request-promise-native');
const responseCode = require('./responseCode').code;

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

function getSmmtResponse(marque, vin, callback, config) {
  const result = {
    success: false,
    errors: [],
    description: '',
    status: '',
    lastUpdate: '',
  };
  request({
    method: 'POST',
    url: config.smmtVincheckUri,
    json: true,
    body: {
      apikey: config.smmtApiKey,
      vin,
      marque,
    },
  })
    .then((recall) => {
      console.info(`SMMT status -> ${recall.status}`);

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

      callback(null, result);
    });
}

exports.vincheck = (marque, vin, callback, config) => {
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
    getSmmtResponse(marque, vin, callback, config);
  } else {
    callback(null, { success: false, errors });
  }
};
