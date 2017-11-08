const chai = require('chai');
const proxyquire = require('proxyquire');

chai.should();

const fakeAwsSdk = {
  KMS: function KMS() {
    return {
      decrypt: () => ({
        promise: () => Promise.resolve({ Plaintext: 'apiKey' }),
      }),
    };
  },
};

describe('When SMMT config loader is called', () => {
  it('then SMMT uri and api key is returned', (done) => {
    const configLoader = proxyquire('../../src/config/smmt', { 'aws-sdk': fakeAwsSdk });
    const loadedConfig = configLoader.load();

    loadedConfig()
      .then((config) => {
        config.should.have.property('smmtVincheckUri');
        config.should.have.property('smmtApiKey');

        done();
      })
      .catch((error) => {
        done(error);
      });
  });
});
