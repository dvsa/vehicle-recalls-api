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
    it('and vehicle has outstanding recall then "Recall Outstanding" it is returned.', () => {

    });

    it('and vehicle has not outstanding recall then "No Recall Outstanding" it is returned.', () => {

    });
  });
});
