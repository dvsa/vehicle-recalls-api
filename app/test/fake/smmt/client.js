const minVinLength = 5;

exports.vincheck = (marque, vin) => {
  const errors = [];

  if (marque === 'RENAULT') {
    if (vin && vin.length >= minVinLength) {
      return {
        success: true,
        description: 'Recall Outstanding',
        status: 'BRAKES',
        lastUpdate: '19022015',
      };
    }
  } else if (marque === 'BMW') {
    if (vin && vin.length >= minVinLength) {
      return {
        success: true,
        description: 'No Recall Outstanding',
        status: '',
        lastUpdate: '19022015',
      };
    }
  } else {
    errors.push('Invalid Marque');
  }

  if (!vin || vin.length < minVinLength) {
    errors.push('Invalid VIN');
  }

  return {
    success: false,
    errors,
  };
};
