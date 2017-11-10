const env = require('../wrapper/envVariablesWrapper');

module.exports = {
  name: env.SERVICE_NAME || 'NotSet',
  env: env.SERVICE_ENV || 'NotSet',
  functionName: 'NotSet',
  functionVersion: 'NotSet',
  logLevel: (env.RECALL_LOG_LEVEL || 'debug').toLowerCase(),
  isKmsEnabled: ((env.KMS_ENABLED || 'false').toLowerCase() === 'true'),
};
