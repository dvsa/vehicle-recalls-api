function NotImplementedError(message) {
  this.name = 'NotImplementedError';
  this.message = (message || '');
}

exports.vincheck = (marque, vin) => {
  throw NotImplementedError(`Still in dev ${vin}`);
};
