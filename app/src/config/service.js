module.exports = {
  name: process.env.SERVICE_NAME || 'NotSet',
  env: process.env.SERVICE_ENV || 'NotSet',
  functionName: 'NotSet',
  functionVersion: 'NotSet',
  logLevel: (process.env.RECALL_LOG_LEVEL || 'error').toLowerCase(),
};
