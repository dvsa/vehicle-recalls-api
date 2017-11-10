const co = require('co');
const AWS = require('../wrapper/awsSdkWrapper');
const loggerFactory = require('../logger/createLogger');
const env = require('../wrapper/envVariablesWrapper');
const config = require('./service');

const logger = loggerFactory.create();
const kms = new AWS.KMS();

let smmtApiKey;

function getSmmtApiKey() {
  return kms.decrypt({
    CiphertextBlob: Buffer.from(env.SMMT_API_KEY, 'base64'),
  }).promise()
    .then((data) => {
      logger.info('SMMT api key decrypted properly.');

      return data.Plaintext.toString('ascii');
    })
    .catch((reason) => {
      logger.error({ context: reason }, 'SMMT api key decryption failed.');
      return undefined;
    });
}

exports.load = () => co.wrap(function* loadConfig() {
  if (!smmtApiKey) {
    if (config.isKmsEnabled) {
      smmtApiKey = yield getSmmtApiKey();
      logger.debug('Smmt api key yield from KMS');
    } else {
      smmtApiKey = env.SMMT_API_KEY;
      logger.debug('Smmt api key read directly from environment variable');
    }

    if (!smmtApiKey) {
      logger.error('Smmt api key is undefined.');
      return undefined;
    }
  }

  return {
    smmtVincheckUri: env.SMMT_API_URI,
    smmtApiKey,
  };
});

exports.smmtApiKey = smmtApiKey;
