const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const realLogger = require('../../src/logger/createLogger').create();

const fakeLogger = sinon.stub(realLogger);

const should = chai.should();

const fakeEnvVariables = {
  SMMT_API_KEY: 'apiKey',
  SMMT_API_URI: 'fakeSmmtUri',
  KMS_ENABLED: 'true',
};

const fakeServiceConfigWithDisabledKms = {
  name: 'NotSet',
  env: 'NotSet',
  functionName: 'NotSet',
  functionVersion: 'NotSet',
  logLevel: 'debug',
  isKmsEnabled: false,
};

const fakeServiceConfigWithEnabledKms = {
  name: 'NotSet',
  env: 'NotSet',
  functionName: 'NotSet',
  functionVersion: 'NotSet',
  logLevel: 'debug',
  isKmsEnabled: true,
};

let executionCount = 0;

const fakeSuccessAwsSdk = {
  decrypt: () => {
    executionCount += 1;
    return Promise.resolve({ Plaintext: fakeEnvVariables.SMMT_API_KEY });
  },
};

const fakeFailureAwsSdk = {
  decrypt: () => Promise.reject(new Error({
    message: 'Error from fake KMS',
  })),
};


describe('When SMMT config loader is called', () => {
  describe('but application logger is not provided', () => {
    it('then error is thrown', () => {
      const configLoader = proxyquire('../../src/config/smmtConfigurationLoader', {
        '@aws-sdk/client-kms': fakeSuccessAwsSdk,
        '../wrapper/envVariablesWrapper': fakeEnvVariables,
        './service': fakeServiceConfigWithEnabledKms,
      });
      return configLoader.load()
        .catch((reason) => {
          reason.message.should.be.eql('External dependence "Logger" is missing.');
        });
    });
  });

  describe('and KMS responded correctly', () => {
    it('then SMMT uri and api key is returned', (done) => {
      const configLoader = proxyquire('../../src/config/smmtConfigurationLoader', {
        '@aws-sdk/client-kms': fakeSuccessAwsSdk,
        '../wrapper/envVariablesWrapper': fakeEnvVariables,
        './service': fakeServiceConfigWithEnabledKms,
      });
      const loadedConfig = configLoader.load(fakeLogger);

      loadedConfig
        .then((config) => {
          config.should.have.property('smmtVincheckUri').eql(fakeEnvVariables.SMMT_API_URI);
          config.should.have.property('smmtApiKey').eql(fakeEnvVariables.SMMT_API_KEY);

          done();
        })
        .catch((error) => {
          done(error);
        });
    });
  });

  describe('and SMMT api key was set during previous config loading', () => {
    it('then KMS will not be called', (done) => {
      executionCount = 0;
      const configLoader = proxyquire('../../src/config/smmtConfigurationLoader', {
        '@aws-sdk/client-kms': fakeSuccessAwsSdk,
        '../wrapper/envVariablesWrapper': fakeEnvVariables,
        './service': fakeServiceConfigWithEnabledKms,
      });
      const loadedConfig = configLoader.load(fakeLogger);

      loadedConfig
        .then(() => {
          configLoader.load(fakeLogger).then((config) => {
            executionCount.should.eql(1);

            config.should.have.property('smmtVincheckUri').eql(fakeEnvVariables.SMMT_API_URI);
            config.should.have.property('smmtApiKey').eql(fakeEnvVariables.SMMT_API_KEY);

            done();
          }).catch((reason) => {
            done(reason);
          });
        })
        .catch((error) => {
          done(error);
        });
    });
  });

  describe('and SMMT api must be read directly from environment variable', () => {
    it('then KMS will not be called', (done) => {
      executionCount = 0;
      const configLoader = proxyquire('../../src/config/smmtConfigurationLoader', {
        '@aws-sdk/client-kms': fakeSuccessAwsSdk,
        '../wrapper/envVariablesWrapper': fakeEnvVariables,
        './service': fakeServiceConfigWithDisabledKms,
      });
      const loadedConfig = configLoader.load(fakeLogger);

      loadedConfig
        .then(() => {
          loadedConfig.then((config) => {
            executionCount.should.eql(0);

            config.should.have.property('smmtVincheckUri').eql(fakeEnvVariables.SMMT_API_URI);
            config.should.have.property('smmtApiKey').eql(fakeEnvVariables.SMMT_API_KEY);

            done();
          }).catch((reason) => {
            done(reason);
          });
        })
        .catch((error) => {
          done(error);
        });
    });
  });

  describe('and KMS responded incorrectly', () => {
    it('then undefined is returned', (done) => {
      const configLoader = proxyquire('../../src/config/smmtConfigurationLoader', {
        '@aws-sdk/client-kms': fakeFailureAwsSdk,
        '../wrapper/envVariablesWrapper': fakeEnvVariables,
        './service': fakeServiceConfigWithEnabledKms,
      });
      const loadedConfig = configLoader.load(fakeLogger);

      loadedConfig
        .then((config) => {
          should.not.exist(config);
          done();
        })
        .catch((error) => {
          done(error);
        });
    });
  });
});
