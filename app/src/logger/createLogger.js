const serviceConfig = require('../config/service').load();
const bunyan = require('bunyan');

module.exports.create = () => bunyan.createLogger({
  name: serviceConfig.name,
  level: serviceConfig.level,
  env: serviceConfig.env,
  functionName: serviceConfig.functionName,
  functionVersion: serviceConfig.functionVersion,
});
