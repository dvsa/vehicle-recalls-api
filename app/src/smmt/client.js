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

function getSmmtResponse(marque, vin, config) {
  return request({
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
    });
}

exports.vincheck = (marque, vin, config) => {
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
    return getSmmtResponse(marque, vin, config);
  }

  return Promise.resolve({ success: false, errors });
};
