const chai = require('chai');
const chaiHttp = require('chai-http');
const service = require('../src/main');

chai.use(chaiHttp);
chai.should();

describe('When recall check request was received', () => {
  describe('and it does not contain vin and marque', () => {
    it('then 400 (Bad Request) http code is returned.');
  });

  describe('and it does not contain vin', () => {
    it('then 400 (Bad Request) http code is returned.');
  });

  describe('and it does not contain marque', () => {
    it('then 400 (Bad Request) http code is returned.');
  });

  describe('and it contain vin and marque', () => {
    it('and vehicle has outstanding recall then http 200 and message "Recall Outstanding" it is returned.', () => {
    });

    it('and vehicle has not outstanding recall then http code 200 and message "No Recall Outstanding" it is returned.', () => {
    });

    it('and SMMT is returning wrong VIN message then http code 403 with error message "Incorrect VIN"', () => {
    });

    it('and SMMT is returning wrong MARQUE message then http code 403 with error message "Incorrect MARQUE"', () => {
    });
  });
});
