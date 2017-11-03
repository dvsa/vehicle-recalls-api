const chai = require('chai');

chai.should();

const configLoader = require('../../src/config/service');

describe('When service config loader is called', () => {
  describe('and RECALL_LOG_LEVEL env variable is set to string "debug"', () => {
    it('then logLevel is set to debug.', () => {
      const oldValue = process.env.RECALL_LOG_LEVEL;
      process.env.RECALL_LOG_LEVEL = 'debug';

      const config = configLoader.load();

      config.should.have.property('logLevel').eql('debug');
      process.env.RECALL_LOG_LEVEL = oldValue;
    });
  });

  describe('and RECALL_LOG_LEVEL env variable is set to string "warn"', () => {
    it('then logLevel is set to warn.', () => {
      const oldValue = process.env.RECALL_LOG_LEVEL;
      process.env.RECALL_LOG_LEVEL = 'warn';

      const config = configLoader.load();

      config.should.have.property('logLevel').eql('warn');
      process.env.RECALL_LOG_LEVEL = oldValue;
    });
  });
});
