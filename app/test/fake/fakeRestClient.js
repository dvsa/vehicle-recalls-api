/* eslint prefer-promise-reject-errors: "off" */

const fakeSmmt = require('./smmt/vincheck');

const validSmmtUri = 'https://validSmmtUri/vincheck';

function MyMockRequest(smmtUri) {
  this.smmtUri = smmtUri;
  this.apiKey = null;

  this.set = (key, value) => {
    if (key === 'x-api-key') {
      this.apiKey = value;
    }
    return this;
  };

  this.type = () => this;

  this.send = body => new Promise((resolve, reject) => {
    if (this.smmtUri !== validSmmtUri) {
      reject({ code: 'ENOTFOUND', errno: 'ENOTFOUND' });
    } else {
      const recall = fakeSmmt.vincheck(this.apiKey, body.Marque, body.vin);
      resolve({ body: recall });
    }
  });
}

exports.post = smmtUri => new MyMockRequest(smmtUri);

exports.validSmmtUri = validSmmtUri;
