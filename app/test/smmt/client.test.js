const chai = require('chai');

chai.should();

const smmtClient = require('../../mock/smmt/client');

describe('When vincheck function was executed', () => {
  it('and marque and vin is undefined then success field must equal false and errors messages must be provided.', () => {
    const recall = smmtClient.vincheck();

    recall.should.have.property('success').eql(false);
    recall.should.have.property('errors');
    recall.errors.should.be.a('array').that.have.same.members(['Invalid Marque', 'Invalid VIN']);
  });

  it('and marque is undefined then success field must equal false and errors messages must be provided.', () => {
    const marque = undefined;
    const vin = '123123123ASD';

    const recall = smmtClient.vincheck(marque, vin);

    recall.should.have.property('success').eql(false);
    recall.should.have.property('errors');
    recall.errors.should.be.a('array').that.have.same.members(['Invalid Marque']);
  });

  it('and vin is undefined then success field must equal false and errors messages must be provided.', () => {
    const marque = 'RENAULT';
    const vin = undefined;

    const recall = smmtClient.vincheck(marque, vin);

    recall.should.have.property('success').eql(false);
    recall.should.have.property('errors');
    recall.errors.should.be.a('array').that.have.same.members(['Invalid VIN']);
  });

  describe('and marque and vin is defined', () => {
    it('and vehicle has outstanding recall then "Recall Outstanding" is returned.', () => {
      const marque = 'RENAULT';
      const vin = 'AISXXXTEST1239617';

      const recall = smmtClient.vincheck(marque, vin);

      recall.should.have.property('success').eql(true);
      recall.should.have.property('description').eql('Recall Outstanding');
      recall.should.have.property('status').eql('BRAKES');
      recall.should.have.property('last_update').eql('19022015');
    });

    it('and vehicle has not outstanding recall then "No Recall Outstanding" is returned.', () => {
      const marque = 'BMW';
      const vin = 'AISXXXTEST1239617';

      const recall = smmtClient.vincheck(marque, vin);

      recall.should.have.property('success').eql(true);
      recall.should.have.property('description').eql('No Recall Outstanding');
      recall.should.have.property('status').eql('');
      recall.should.have.property('last_update').eql('19022015');
    });

    it('and marque is not supported by SMMT then "Invalid Marque" error message is return with success set to false.', () => {
      const marque = 'NewAwesomeRENAULT';
      const vin = 'AISXXXTEST1239617';

      const recall = smmtClient.vincheck(marque, vin);

      recall.should.have.property('success').eql(false);
      recall.should.have.property('errors');
      recall.errors.should.be.a('array').that.have.same.members(['Invalid Marque']);
    });
  });
});
