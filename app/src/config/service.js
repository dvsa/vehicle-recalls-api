exports.load = () => ({
  name: process.env.SERVICE_NAME || 'NotSet',
  env: process.env.SERVICE_ENV || 'NotSet',
  functionName: process.env.AWS_LAMBDA_FUNCTION_NAME || 'NotSet',
  functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION || 'NotSet',
  isLoggerSilent: ((process.env.SERVICE_SILENT_LOGGER || 'FALSE').toUpperCase() === 'TRUE'),
  isDebug: ((process.env.RECALL_DEBUG_MODE || 'FALSE').toUpperCase() === 'TRUE'),
});
