const bunyan = require('bunyan');
const safeJsonStringify = require('safe-json-stringify');
const serviceConfig = require('../config/service');

function stderrWithLevelAsString() {
  return {
    write: (entry) => {
      const log = entry;

      delete log.pid;
      delete log.hostname;

      process.stderr.write(`${safeJsonStringify(Object.assign(log, {
        level: bunyan.nameFromLevel[log.level],
      }))}\n`);
    },
  };
}

module.exports.create = traceId => bunyan.createLogger({
  name: serviceConfig.name,
  level: serviceConfig.logLevel,
  env: serviceConfig.env,
  functionName: serviceConfig.functionName,
  functionVersion: serviceConfig.functionVersion,
  traceId,
  streams: [{
    type: 'raw',
    stream: stderrWithLevelAsString(),
  }],
});
