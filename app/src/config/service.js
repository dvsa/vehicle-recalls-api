exports.load = () => ({
  name: process.env.SERVICE_NAME || 'NotSet',
  env: process.env.SERVICE_ENV || 'NotSet',
  functionName: process.env.AWS_LAMBDA_FUNCTION_NAME || 'NotSet',
  functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION || 'NotSet',
  logLevel: (process.env.RECALL_LOG_LEVEL || 'debug').toLowerCase(),
});
