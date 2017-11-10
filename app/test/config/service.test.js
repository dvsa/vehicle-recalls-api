const chai = require('chai');
const proxyquire = require('proxyquire');

chai.should();

const fakeEnvVariablesWithEnabledKms = {
  SMMT_API_KEY: 'apiKey',
  SMMT_API_URI: 'fakeSmmtUri',
  KMS_ENABLED: 'true',
};

const fakeEnvVariablesWithDisabledKms = {
  SMMT_API_KEY: 'apiKey',
  SMMT_API_URI: 'fakeSmmtUri',
  KMS_ENABLED: 'false',
};

describe('When service config is loaded', () => {
  describe('and KMS must be used', () => {
    it('then isKmsEnabled properties is set to true', () => {
      const serviceConfig = proxyquire('../../src/config/service', {
        '../wrapper/envVariablesWrapper': fakeEnvVariablesWithEnabledKms,
      });

      serviceConfig.should.have.property('isKmsEnabled').eql(true);
    });
  });

  describe('and KMS must not be used', () => {
    it('then isKmsEnabled properties is set to false', () => {
      const serviceConfig = proxyquire('../../src/config/service', {
        '../wrapper/envVariablesWrapper': fakeEnvVariablesWithDisabledKms,
      });

      serviceConfig.should.have.property('isKmsEnabled').eql(false);
    });
  });
});
