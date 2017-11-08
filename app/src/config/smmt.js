const AWS = require('aws-sdk');
const loggerFactory = require('../logger/createLogger');

const logger = loggerFactory.create();
const kms = new AWS.KMS();

let smmtApiKey;

exports.load = () => {
  if (!smmtApiKey) {
    kms.decrypt({
      CiphertextBlob: Buffer(process.env.SMMT_API_KEY, 'base64'),
    }).promise()
      .then((data) => {
        smmtApiKey = data.Plaintext.toString('ascii');
      })
      .catch((reason) => {
        logger.error(reason, 'SMMT api key decryption failed.');
      });
  }

  return {
    smmtVincheckUri: process.env.SMMT_API_URI,
    smmtApiKey,
  };
};
