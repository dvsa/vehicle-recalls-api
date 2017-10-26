/* eslint prefer-promise-reject-errors: "off" */

const fakeSmmt = require('./smmt/vincheck');

const validSmmtUri = 'https://validSmmtUri/vincheck';

function send(smmtUri) {
  return body => new Promise((resolve, reject) => {
    if (smmtUri !== validSmmtUri) {
      reject({ code: 'ENOTFOUND', errno: 'ENOTFOUND' });
    } else {
      const recall = fakeSmmt.vincheck(body.apikey, body.marque, body.vin);
      resolve({ body: recall });
    }
  });
}

function type(smmtUri) {
  return () => ({
    send: send(smmtUri),
  });
}

exports.post = smmtUri => ({
  type: type(smmtUri),
});

exports.validSmmtUri = validSmmtUri;
