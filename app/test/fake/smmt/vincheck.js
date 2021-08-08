const minVinLength = 10;
const validSmmtKey = 'validSmmtKey';

exports.validSmmtKey = validSmmtKey;

exports.vincheck = (apiKey, marque, vin) => {
  if (apiKey !== validSmmtKey) {
    return {
      status: 401,
      status_description: 'Unauthorized',
      vin,
      vin_recall_status: '',
      last_update: '',
    };
  }

  if (!vin || vin.length < minVinLength) {
    return {
      status: 403,
      status_description: 'Bad Request - Invalid Vin',
      vin_recall_status: '',
      last_update: '',
      vin,
    };
  }

  if (marque === 'RENAULT') {
    if (vin && vin.length >= minVinLength) {
      return {
        status: 201,
        status_description: 'Recall outstanding',
        vin_recall_status: 'BRAKES',
        last_update: '19022015',
        vin,
      };
    }
  } else if (marque === 'BMW') {
    if (vin && vin.length >= minVinLength) {
      return {
        status: 200,
        status_description: 'No Recall outstanding',
        vin_recall_status: '',
        last_update: '19022015',
        vin,
      };
    }
  } else if (marque === 'UNKNOWNRES') {
    return {
      status: 500,
      status_description: 'unknown error',
      vin_recall_status: '',
      last_update: '19022015',
      vin,
    };
  }

  return {
    status: 402,
    status_description: 'Bad Request - Invalid Marque',
    vin_recall_status: '',
    last_update: '',
    vin,
  };
};
