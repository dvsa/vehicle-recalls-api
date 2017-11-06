const bunyan = require('bunyan');
const serviceConfig = require('../config/service').load();

module.exports.create = () => bunyan.createLogger({
  name: serviceConfig.name,
  level: serviceConfig.logLevel,
  env: serviceConfig.env,
  functionName: serviceConfig.functionName,
  functionVersion: serviceConfig.functionVersion,
});
