const chai = require('chai');

chai.should();

const configLoader = require('../../src/config/service');

describe('When service config loader is called', () => {
  describe('and RECALL_DEBUG_MODE env variable is set to string "false"', () => {
    it('then config with isDebug property equal false is returned', () => {
      process.env.RECALL_DEBUG_MODE = 'false';

      const config = configLoader.load();

      config.should.have.property('isDebug').eql(false);
    });
  });

  describe('and RECALL_DEBUG_MODE env variable is set to string "true"', () => {
    it('then config with isDebug property equal true is returned', () => {
      process.env.RECALL_DEBUG_MODE = 'true';

      const config = configLoader.load();

      config.should.have.property('isDebug').eql(true);
    });
  });

  describe('and RECALL_DEBUG_MODE env variable is unset', () => {
    it('then config with isDebug property equal false is returned', () => {
      process.env.RECALL_DEBUG_MODE = undefined;

      const config = configLoader.load();

      config.should.have.property('isDebug').eql(false);
    });
  });
});
