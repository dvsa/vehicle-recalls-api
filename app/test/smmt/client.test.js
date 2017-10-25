const chai = require('chai');

chai.should();

const smmtClient = require('../../src/smmt/client');

describe('SMMT Client -> When vincheck function was executed', () => {
  it('and api key is incorrect then "Unauthorized" error and success equal false must be returned.', (done) => {
    const marque = 'RENAULT';
    const vin = 'AISXXXTEST1239617';
    const config = {
      smmtVincheckUri: 'https://o2jf3z94li.execute-api.eu-west-2.amazonaws.com/dev/vincheck',
      smmtApiKey: 'wrongApiKey',
    };

    const result = smmtClient.vincheck(marque, vin, config);
    result.then((recall) => {
      recall.should.have.property('success').eql(false);
      recall.should.have.property('errors');
      recall.errors.should.be.a('array').that.have.same.members(['Unauthorized']);

      done();
    });
  });

  it('and marque and vin is undefined then success field must equal false and errors messages must be provided.', (done) => {
    const marque = undefined;
    const vin = undefined;
    const config = {
      smmtVincheckUri: 'https://o2jf3z94li.execute-api.eu-west-2.amazonaws.com/dev/vincheck',
      smmtApiKey: 'localApiKey',
    };

    const result = smmtClient.vincheck(marque, vin, config);
    result.then((recall) => {
      recall.should.have.property('success').eql(false);
      recall.should.have.property('errors');
      recall.errors.should.be.a('array').that.have.same.members(['Invalid Marque', 'Invalid VIN']);

      done();
    });
  });

  it('and marque is undefined then success field must equal false and errors messages must be provided.', (done) => {
    const marque = undefined;
    const vin = '123123123ASD';
    const config = {
      smmtVincheckUri: 'https://o2jf3z94li.execute-api.eu-west-2.amazonaws.com/dev/vincheck',
      smmtApiKey: 'localApiKey',
    };

    const result = smmtClient.vincheck(marque, vin, config);
    result.then((recall) => {
      recall.should.have.property('success').eql(false);
      recall.should.have.property('errors');
      recall.errors.should.be.a('array').that.have.same.members(['Invalid Marque']);

      done();
    });
  });

  it('and vin is undefined then success field must equal false and errors messages must be provided.', (done) => {
    const marque = 'RENAULT';
    const vin = undefined;
    const config = {
      smmtVincheckUri: 'https://o2jf3z94li.execute-api.eu-west-2.amazonaws.com/dev/vincheck',
      smmtApiKey: 'localApiKey',
    };

    const result = smmtClient.vincheck(marque, vin, config);
    result.then((recall) => {
      recall.should.have.property('success').eql(false);
      recall.should.have.property('errors');
      recall.errors.should.be.a('array').that.have.same.members(['Invalid VIN']);

      done();
    });
  });

  describe('and marque and vin is defined', () => {
    it('and vehicle has outstanding recall then "Recall Outstanding" is returned.', (done) => {
      const marque = 'RENAULT';
      const vin = 'AISXXXTEST1239617';
      const config = {
        smmtVincheckUri: 'https://o2jf3z94li.execute-api.eu-west-2.amazonaws.com/dev/vincheck',
        smmtApiKey: 'localApiKey',
      };

      const result = smmtClient.vincheck(marque, vin, config);
      result.then((recall) => {
        recall.should.have.property('success').eql(true);
        recall.should.have.property('description').eql('Recall Outstanding');
        recall.should.have.property('status').eql('BRAKES');
        recall.should.have.property('lastUpdate').eql('19022015');

        done();
      });
    });

    it('and vehicle has not outstanding recall then "No Recall Outstanding" is returned.', (done) => {
      const marque = 'BMW';
      const vin = 'AISXXXTEST1239617';
      const config = {
        smmtVincheckUri: 'https://o2jf3z94li.execute-api.eu-west-2.amazonaws.com/dev/vincheck',
        smmtApiKey: 'localApiKey',
      };

      const result = smmtClient.vincheck(marque, vin, config);
      result.then((recall) => {
        recall.should.have.property('success').eql(true);
        recall.should.have.property('description').eql('No Recall Outstanding');
        recall.should.have.property('status').eql('');
        recall.should.have.property('lastUpdate').eql('19022015');

        done();
      });
    });

    it('and marque is not supported by SMMT then "Bad Request - Invalid Marque" error message is return with success set to false.', (done) => {
      const marque = 'NewAwesomeRENAULT';
      const vin = 'AISXXXTEST1239617';
      const config = {
        smmtVincheckUri: 'https://o2jf3z94li.execute-api.eu-west-2.amazonaws.com/dev/vincheck',
        smmtApiKey: 'localApiKey',
      };

      const result = smmtClient.vincheck(marque, vin, config);
      result.then((recall) => {
        recall.should.have.property('success').eql(false);
        recall.should.have.property('errors');
        recall.errors.should.be.a('array').that.have.same.members(['Bad Request - Invalid Marque']);

        done();
      });
    });
  });
});
