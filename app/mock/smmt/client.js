exports.vincheck = (marque, vin) => {
  if (marque === 'RENAULT' && vin.length > 0) {
    return {
      success: true,
      description: 'Recall Outstanding',
      status: 'BRAKES',
      last_update: '19022015',
    };
  } else if (marque === 'BMW' && vin.length > 0) {
    return {
      success: true,
      description: 'No Recall Outstanding',
      status: '',
      last_update: '19022015',
    };
  }

  return {
    success: false,
    errors: ['Invalid Marque'],
  };
};
