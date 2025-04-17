const co = require('co');
const env = require('../wrapper/envVariablesWrapper');
const config = require('./service');
const { decrypt } = require('@aws-sdk/client-kms');

let logger;
let smmtApiKey;

function getSmmtApiKey() {
  logger.debug({ context: { ciphertext: env.SMMT_API_KEY } }, 'Attempting to decrypt ciphertext.');

  return (
    decrypt({
      CiphertextBlob: Buffer.from(env.SMMT_API_KEY, 'base64'),
    })
      .then((data) => {
        logger.info('SMMT api key decrypted properly.');

        return data.Plaintext.toString('ascii');
      })
      .catch((reason) => {
        logger.error({ context: reason }, 'SMMT api key decryption failed.');
        return undefined;
      })
  );
}

exports.load = co.wrap(function* loadConfig(applicationLogger) {
  if (applicationLogger) {
    logger = applicationLogger;
  } else {
    return Promise.reject(new Error('External dependence "Logger" is missing.'));
  }

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
