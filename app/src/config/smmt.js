const co = require('co');
const AWS = require('aws-sdk');
const loggerFactory = require('../logger/createLogger');

const logger = loggerFactory.create();
const kms = new AWS.KMS();

let smmtApiKey;

function getSmmtApiKey() {
  return kms.decrypt({
    CiphertextBlob: Buffer.from(process.env.SMMT_API_KEY, 'base64'),
  }).promise()
    .catch((reason) => {
      logger.error(reason, 'SMMT api key decryption failed.');
    })
    .then((data) => {
      logger.info('SMMT api key decrypted properly.');
      return data.Plaintext.toString('ascii');
    });
}

exports.load = () => co.wrap(function* loadConfig() {
  if (!smmtApiKey) {
    smmtApiKey = yield getSmmtApiKey();
  }

  return {
    smmtVincheckUri: process.env.SMMT_API_URI,
    smmtApiKey,
  };
});
