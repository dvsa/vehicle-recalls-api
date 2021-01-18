const chai = require('chai');
const chaiHttp = require('chai-http');
const proxyquire = require('proxyquire');

chai.use(chaiHttp);
chai.should();

const fakeRestClient = require('./fake/fakeRestClient');
const fakeVincheck = require('./fake/smmt/vincheck');

const correctSmmtConfig = {
  load: () => ({
    smmtVincheckUri: fakeRestClient.validSmmtUri,
    smmtApiKey: fakeVincheck.validSmmtKey,
  }),
};

const serviceConfig = {
  functionName: 'NotSet',
  functionVersion: 'NotSet',
};

describe('When service is created', () => {
  describe('and handler was executed', () => {
    it('then service configuration is updated and contain function and version from request context', (done) => {
      const service = proxyquire('../src/main', { './config/service': serviceConfig, './config/smmtConfigurationLoader': correctSmmtConfig, superagent: fakeRestClient });

      service.handler({}, {
        functionName: 'testFunctionName',
        functionVersion: 'v999',
      }, () => {
        serviceConfig.should.have.property('functionName').eql('testFunctionName');
        serviceConfig.should.have.property('functionVersion').eql('v999');

        done();
      });
    });
  });
});

describe('Recall lambda -> When recall check request was received', () => {
  describe('but recall lambda has incorrect SMMT key', () => {
    it('then 403 http code is returned.', (done) => {
      const incorrectSmmtConfig = {
        load: () => ({
          smmtVincheckUri: fakeRestClient.validSmmtUri,
          smmtApiKey: 'incorrectApiKey',
        }),
      };
      const misconfiguredService = proxyquire('../src/main', { './config/smmtConfigurationLoader': incorrectSmmtConfig, superagent: fakeRestClient });

      chai.request(misconfiguredService.app)
        .get('/recalls')
        .query({ make: 'BMW', vin: 'AIS123TEST1239607' })
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });
  });

  describe('but recall lambda has incorrect SMMT uri and uri does not exist', () => {
    it('then 500 http code is returned.', (done) => {
      const incorrectSmmtConfig = {
        load: () => ({
          smmtVincheckUri: 'http://local/wrong/vincheck',
          smmtApiKey: fakeVincheck.validSmmtKey,
        }),
      };
      const misconfiguredService = proxyquire('../src/main', { './config/smmtConfigurationLoader': incorrectSmmtConfig, superagent: fakeRestClient });

      chai.request(misconfiguredService.app)
        .get('/recalls')
        .query({ make: 'BMW', vin: 'AIS123TEST1239607' })
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });

  describe('and it does not contain vin and make', () => {
    it('then 400 (Bad Request) http code is returned.', (done) => {
      const service = proxyquire('../src/main', { './config/smmtConfigurationLoader': correctSmmtConfig, superagent: fakeRestClient });

      chai.request(service.app)
        .get('/recalls')
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  describe('and it does not contain vin', () => {
    it('then 400 (Bad Request) http code is returned.', (done) => {
      const service = proxyquire('../src/main', { './config/smmtConfigurationLoader': correctSmmtConfig, superagent: fakeRestClient });

      chai.request(service.app)
        .get('/recalls')
        .query({ make: 'AnyMarque' })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  describe('and it does not contain make', () => {
    it('then 400 (Bad Request) http code is returned.', (done) => {
      const service = proxyquire('../src/main', { './config/smmtConfigurationLoader': correctSmmtConfig, superagent: fakeRestClient });

      chai.request(service.app)
        .get('/recalls')
        .query({ vin: 'AnyVin' })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  describe('and it contain vin and make', () => {
    describe('but vin is incorrect', () => {
      it('then 403 http code is returned and error message "Invalid VIN"', (done) => {
        const service = proxyquire('../src/main', { './config/smmtConfigurationLoader': correctSmmtConfig, superagent: fakeRestClient });

        chai.request(service.app)
          .get('/recalls')
          .query({ make: 'RENAULT', vin: '1234567' })
          .end((err, res) => {
            res.should.have.status(422);
            res.should.have.header('content-type', 'application/json; charset=utf-8');

            res.body.should.be.an('object');
            res.body.should.have.property('errors').to.be.an('array');
            res.body.errors.should.have.lengthOf(1);
            res.body.should.have.property('errors').eql(['Bad Request - Invalid Vin']);

            done();
          });
      });
    });

    it('and vehicle has outstanding recall then http 200 and message "Recall outstanding" it is returned.', (done) => {
      const service = proxyquire('../src/main', { './config/smmtConfigurationLoader': correctSmmtConfig, superagent: fakeRestClient });

      chai.request(service.app)
        .get('/recalls')
        .query({ make: 'RENAULT', vin: 'AISXXXTEST1239607' })
        .end((err, res) => {
          if (err) done(err);

          res.should.have.status(200);
          res.should.have.header('content-type', 'application/json; charset=utf-8');

          res.body.should.be.an('object');
          res.body.should.have.property('status_description').eql('Recall outstanding');
          res.body.should.have.property('vin_recall_status').eql('BRAKES');
          res.body.should.have.property('last_update').eql('19022015');

          done();
        });
    });

    it('and vehicle has not outstanding recall then http code 200 and message "No Recall Outstanding" it is returned.', (done) => {
      const service = proxyquire('../src/main', { './config/smmtConfigurationLoader': correctSmmtConfig, superagent: fakeRestClient });

      chai.request(service.app)
        .get('/recalls')
        .query({ make: 'BMW', vin: 'AIS123TEST1239607' })
        .end((err, res) => {
          if (err) done(err);

          res.should.have.status(200);
          res.should.have.header('content-type', 'application/json; charset=utf-8');

          res.body.should.be.an('object');
          res.body.should.have.property('status_description').eql('No Recall outstanding');
          res.body.should.have.property('vin_recall_status').eql('');
          res.body.should.have.property('last_update').eql('19022015');

          done();
        });
    });

    it('and SMMT is returning wrong MARQUE message then http code 403 with error message "Incorrect MARQUE"', (done) => {
      const service = proxyquire('../src/main', { './config/smmtConfigurationLoader': correctSmmtConfig, superagent: fakeRestClient });

      chai.request(service.app)
        .get('/recalls')
        .query({ make: 'UnknownBMW', vin: 'AIS123TEST1239607' })
        .end((err, res) => {
          res.should.have.status(422);
          res.should.have.header('content-type', 'application/json; charset=utf-8');

          res.body.should.be.an('object');
          res.body.should.have.property('errors').to.be.an('array');
          res.body.errors.should.have.lengthOf(1);
          res.body.should.have.property('errors').eql(['Bad Request - Invalid Marque']);

          done();
        });
    });

    it('and SMMT is returning an unknown response then', (done) => {
      const service = proxyquire('../src/main', { './config/smmtConfigurationLoader': correctSmmtConfig, superagent: fakeRestClient });

      chai.request(service.app)
        .get('/recalls')
        .query({ make: 'UNKNOWNRES', vin: 'AISXXXTEST1239607' })
        .end((err, res) => {
          res.should.have.status(403);
          res.should.have.header('content-type', 'application/json; charset=utf-8');

          res.body.should.be.an('object');
          res.body.should.have.property('errors').to.be.an('array');
          res.body.errors.should.have.lengthOf(2);
          res.body.should.have.property('errors').eql(['Unknown SMMT code: 500', 'unknown error']);

          done();
        });
    });
  });
});
