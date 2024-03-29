const chai = require('chai');
const sinon = require('sinon');

const fakeRestClient = require('../fake/fakeRestClient');
const fakeVincheck = require('../fake/smmt/vincheck');

const smmtClientFactory = require('../../src/smmt/client');
const realLogger = require('../../src/logger/createLogger').create();

const fakeLogger = sinon.stub(realLogger);
chai.should();

describe('When SMMT client is created', () => {
  describe('and no parameters are provided to the create method', () => {
    it('then error is returned', () => {
      const smmtClient = smmtClientFactory.create();

      smmtClient.should.be.a('Error');
      smmtClient.should.have.property('message').eql('SMMT client arguments are missing.');
    });
  });

  describe('and logger instance is not provided to the create method', () => {
    it('then error is returned', () => {
      const config = {
        smmtVincheckUri: fakeRestClient.validSmmtUri,
        smmtApiKey: 'wrongApiKey',
      };
      const smmtClient = smmtClientFactory.create(fakeRestClient, config);

      smmtClient.should.be.a('Error');
      smmtClient.should.have.property('message').eql('External dependence "Logger" is missing.');
    });
  });
});

describe('SMMT Client -> When vincheck function was executed', () => {
  it('and api key is incorrect then "Unauthorized" error and success equal false must be returned.', (done) => {
    const marque = 'RENAULT';
    const vin = 'AISXXXTEST1239617';
    const config = {
      smmtVincheckUri: fakeRestClient.validSmmtUri,
      smmtApiKey: 'wrongApiKey',
    };
    const smmtClient = smmtClientFactory.create(fakeRestClient, config, fakeLogger);

    const result = smmtClient.vincheck(marque, vin);
    result.then((recall) => {
      recall.should.have.property('success').eql(false);
      recall.should.have.property('errors');
      recall.errors.should.be.an('array').that.have.same.members(['Unauthorized']);

      done();
    }).catch((error) => {
      done(error);
    });
  });

  it('and marque and vin is undefined then success field must equal false and errors messages must be provided.', (done) => {
    const marque = undefined;
    const vin = undefined;
    const config = {
      smmtVincheckUri: fakeRestClient.validSmmtUri,
      smmtApiKey: fakeVincheck.validSmmtKey,
    };
    const smmtClient = smmtClientFactory.create(fakeRestClient, config, fakeLogger);

    const result = smmtClient.vincheck(marque, vin);
    result.then((recall) => {
      recall.should.have.property('success').eql(false);
      recall.should.have.property('errors');
      recall.errors.should.be.an('array').that.have.same.members(['Invalid Marque', 'Invalid VIN']);

      done();
    }).catch((error) => {
      done(error);
    });
  });

  it('and marque is undefined then success field must equal false and errors messages must be provided.', (done) => {
    const marque = undefined;
    const vin = '123123123ASD';
    const config = {
      smmtVincheckUri: fakeRestClient.validSmmtUri,
      smmtApiKey: fakeVincheck.validSmmtKey,
    };
    const smmtClient = smmtClientFactory.create(fakeRestClient, config, fakeLogger);

    const result = smmtClient.vincheck(marque, vin, config);
    result.then((recall) => {
      recall.should.have.property('success').eql(false);
      recall.should.have.property('errors');
      recall.errors.should.be.an('array').that.have.same.members(['Invalid Marque']);

      done();
    }).catch((error) => {
      done(error);
    });
  });

  it('and vin is undefined then success field must equal false and errors messages must be provided.', (done) => {
    const marque = 'RENAULT';
    const vin = undefined;
    const config = {
      smmtVincheckUri: fakeRestClient.validSmmtUri,
      smmtApiKey: fakeVincheck.validSmmtKey,
    };
    const smmtClient = smmtClientFactory.create(fakeRestClient, config, fakeLogger);

    const result = smmtClient.vincheck(marque, vin);
    result.then((recall) => {
      recall.should.have.property('success').eql(false);
      recall.should.have.property('errors');
      recall.errors.should.be.an('array').that.have.same.members(['Invalid VIN']);

      done();
    }).catch((error) => {
      done(error);
    });
  });

  describe('and marque and vin is defined', () => {
    it('and vehicle has outstanding recall then "Recall outstanding" is returned.', (done) => {
      const marque = 'RENAULT';
      const vin = 'AISXXXTEST1239617';
      const config = {
        smmtVincheckUri: fakeRestClient.validSmmtUri,
        smmtApiKey: fakeVincheck.validSmmtKey,
      };
      const smmtClient = smmtClientFactory.create(fakeRestClient, config, fakeLogger);

      const result = smmtClient.vincheck(marque, vin);
      result.then((recall) => {
        recall.should.have.property('success').eql(true);
        recall.should.have.property('description').eql('Recall Outstanding');
        recall.should.have.property('status').eql('BRAKES');
        recall.should.have.property('lastUpdate').eql('19022015');

        done();
      }).catch((error) => {
        done(error);
      });
    });

    it('and vehicle has not outstanding recall then "No Recall Outstanding" is returned.', (done) => {
      const marque = 'BMW';
      const vin = 'AISXXXTEST1239617';
      const config = {
        smmtVincheckUri: fakeRestClient.validSmmtUri,
        smmtApiKey: fakeVincheck.validSmmtKey,
      };
      const smmtClient = smmtClientFactory.create(fakeRestClient, config, fakeLogger);

      const result = smmtClient.vincheck(marque, vin);
      result.then((recall) => {
        recall.should.have.property('success').eql(true);
        recall.should.have.property('description').eql('No Recall outstanding');
        recall.should.have.property('status').eql('');
        recall.should.have.property('lastUpdate').eql('19022015');

        done();
      }).catch((error) => {
        done(error);
      });
    });

    it('and marque is not supported by SMMT then "Bad Request - Invalid Marque" error message is return with success set to false.', (done) => {
      const marque = 'NewAwesomeRENAULT';
      const vin = 'AISXXXTEST1239617';
      const config = {
        smmtVincheckUri: fakeRestClient.validSmmtUri,
        smmtApiKey: fakeVincheck.validSmmtKey,
      };
      const smmtClient = smmtClientFactory.create(fakeRestClient, config, fakeLogger);

      const result = smmtClient.vincheck(marque, vin);
      result.then((recall) => {
        recall.should.have.property('success').eql(false);
        recall.should.have.property('errors');
        recall.errors.should.be.an('array').that.have.same.members(['Bad Request - Invalid Marque']);

        done();
      }).catch((error) => {
        done(error);
      });
    });
  });
});
