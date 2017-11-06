const bunyan = require('bunyan');
const safeJsonStringify = require('safe-json-stringify');
const serviceConfig = require('../config/service');

function stderrWithLevelAsString() {
  return {
    write: entry => process.stderr.write(`${safeJsonStringify(Object.assign(entry, {
      level: bunyan.nameFromLevel[entry.level],
    }))}\n`),
  };
}

module.exports.create = () => bunyan.createLogger({
  name: serviceConfig.name,
  level: serviceConfig.logLevel,
  env: serviceConfig.env,
  functionName: serviceConfig.functionName,
  functionVersion: serviceConfig.functionVersion,
  streams: [{
    type: 'raw',
    stream: stderrWithLevelAsString(),
  }],
});
