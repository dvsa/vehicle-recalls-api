const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
chai.should();

const service = require('../src/main');
const fakeSmmtClient = require('../mock/smmt/client');


describe('When recall check request was received', () => {
  describe('and it does not contain vin and marque', () => {
    it('then 400 (Bad Request) http code is returned.', (done) => {
      chai.request(service.app(fakeSmmtClient))
        .get('/recalls')
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  describe('and it does not contain vin', () => {
    it('then 400 (Bad Request) http code is returned.', (done) => {
      chai.request(service.app(fakeSmmtClient))
        .get('/recalls')
        .query({ marque: 'AnyMarque' })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  describe('and it does not contain marque', () => {
    it('then 400 (Bad Request) http code is returned.', (done) => {
      chai.request(service.app(fakeSmmtClient))
        .get('/recalls')
        .query({ vin: 'AnyVin' })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  describe('and it contain vin and marque', () => {
    it('and vehicle has outstanding recall then http 200 and message "Recall Outstanding" it is returned.', (done) => {
      chai.request(service.app(fakeSmmtClient))
        .get('/recalls')
        .query({ marque: 'RENAULT', vin: 'AISXXXTEST1239607' })
        .end((err, res) => {
          if (err) done(err);

          res.should.have.status(200);
          res.should.have.header('content-type', 'application/json; charset=utf-8');

          res.body.should.be.a('object');
          res.body.should.have.property('status_description').eql('Recall Outstanding');
          res.body.should.have.property('vin_recall_status').eql('BRAKES');
          res.body.should.have.property('last_update').eql('19022015');

          done();
        });
    });

    it('and vehicle has not outstanding recall then http code 200 and message "No Recall Outstanding" it is returned.', (done) => {
      chai.request(service.app(fakeSmmtClient))
        .get('/recalls')
        .query({ marque: 'BMW', vin: 'AIS123TEST1239607' })
        .end((err, res) => {
          if (err) done(err);

          res.should.have.status(200);
          res.should.have.header('content-type', 'application/json; charset=utf-8');

          res.body.should.be.a('object');
          res.body.should.have.property('status_description').eql('No Recall Outstanding');
          res.body.should.have.property('vin_recall_status').eql('');
          res.body.should.have.property('last_update').eql('19022015');

          done();
        });
    });

    // it('and SMMT is returning wrong VIN message
    //     then http code 403 with error message "Incorrect VIN"', () => {
    // });

    it('and SMMT is returning wrong MARQUE message then http code 403 with error message "Incorrect MARQUE"', (done) => {
      chai.request(service.app(fakeSmmtClient))
        .get('/recalls')
        .query({ marque: 'UnknownBMW', vin: 'AIS123TEST1239607' })
        .end((err, res) => {
          res.should.have.status(403);
          res.should.have.header('content-type', 'application/json; charset=utf-8');

          res.body.should.be.a('object');
          res.body.should.have.property('errors').to.be.an('array');
          res.body.errors.should.have.lengthOf(1);
          res.body.should.have.property('errors').eql(['Invalid Marque']);

          done();
        });
    });
  });
});
