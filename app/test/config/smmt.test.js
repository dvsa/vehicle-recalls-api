const chai = require('chai');

chai.should();

const configLoader = require('../../src/config/smmt');

describe('When config loader is called', () => {
  it('then SMMT uri and api key is returned', () => {
    const config = configLoader.load();

    config.should.have.property('smmtVincheckUri');
    config.should.have.property('smmtApiKey');
  });
});
