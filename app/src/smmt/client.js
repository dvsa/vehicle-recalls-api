const rp = require('request-promise');

const smmtInvalidApiKeyCode = 401;
const smmtInvalidMarqueCode = 402;
const smmtNoRecallCode = 200;
const smmtRecallCode = 201;

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
  rp({
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
        case smmtInvalidApiKeyCode:
          result.success = false;
          result.errors.push(recall.status_description);
          break;
        case smmtInvalidMarqueCode:
          result.success = false;
          result.errors.push(recall.status_description);
          break;
        case smmtNoRecallCode:
          result.success = true;
          break;
        case smmtRecallCode:
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
