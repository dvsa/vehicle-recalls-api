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

describe('Recall lambda -> When recall check request was received', () => {
  describe('but recall lambda has incorrect SMMT setting', () => {
    it('then 418 http code is returned.', (done) => {
      const incorrectSmmtConfig = {
        load: () => ({
          smmtVincheckUri: 'http://local/wrong/vincheck',
          smmtApiKey: 'localApiKey',
        }),
      };
      const misconfiguredService = proxyquire('../src/main', { './config/loader': incorrectSmmtConfig, superagent: fakeRestClient });

      chai.request(misconfiguredService.app)
        .get('/recalls')
        .query({ make: 'BMW', vin: 'AIS123TEST1239607' })
        .end((err, res) => {
          res.should.have.status(418);
          done();
        });
    });
  });
});

describe('Recall lambda -> When recall check request was received', () => {
  describe('and it does not contain vin and make', () => {
    it('then 400 (Bad Request) http code is returned.', (done) => {
      const service = proxyquire('../src/main', { './config/loader': correctSmmtConfig, superagent: fakeRestClient });

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
      const service = proxyquire('../src/main', { './config/loader': correctSmmtConfig, superagent: fakeRestClient });

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
      const service = proxyquire('../src/main', { './config/loader': correctSmmtConfig, superagent: fakeRestClient });

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
    it('and vehicle has outstanding recall then http 200 and message "Recall Outstanding" it is returned.', (done) => {
      const service = proxyquire('../src/main', { './config/loader': correctSmmtConfig, superagent: fakeRestClient });

      chai.request(service.app)
        .get('/recalls')
        .query({ make: 'RENAULT', vin: 'AISXXXTEST1239607' })
        .end((err, res) => {
          if (err) done(err);

          res.should.have.status(200);
          res.should.have.header('content-type', 'application/json; charset=utf-8');

          res.body.should.be.an('object');
          res.body.should.have.property('status_description').eql('Recall Outstanding');
          res.body.should.have.property('vin_recall_status').eql('BRAKES');
          res.body.should.have.property('last_update').eql('19022015');

          done();
        });
    });

    it('and vehicle has not outstanding recall then http code 200 and message "No Recall Outstanding" it is returned.', (done) => {
      const service = proxyquire('../src/main', { './config/loader': correctSmmtConfig, superagent: fakeRestClient });

      chai.request(service.app)
        .get('/recalls')
        .query({ make: 'BMW', vin: 'AIS123TEST1239607' })
        .end((err, res) => {
          if (err) done(err);

          res.should.have.status(200);
          res.should.have.header('content-type', 'application/json; charset=utf-8');

          res.body.should.be.an('object');
          res.body.should.have.property('status_description').eql('No Recall Outstanding');
          res.body.should.have.property('vin_recall_status').eql('');
          res.body.should.have.property('last_update').eql('19022015');

          done();
        });
    });

    it('and SMMT is returning wrong MARQUE message then http code 403 with error message "Incorrect MARQUE"', (done) => {
      const service = proxyquire('../src/main', { './config/loader': correctSmmtConfig, superagent: fakeRestClient });

      chai.request(service.app)
        .get('/recalls')
        .query({ make: 'UnknownBMW', vin: 'AIS123TEST1239607' })
        .end((err, res) => {
          res.should.have.status(403);
          res.should.have.header('content-type', 'application/json; charset=utf-8');

          res.body.should.be.an('object');
          res.body.should.have.property('errors').to.be.an('array');
          res.body.errors.should.have.lengthOf(1);
          res.body.should.have.property('errors').eql(['Bad Request - Invalid Marque']);

          done();
        });
    });
  });
});
