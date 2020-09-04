import getRevokedAssertions from '../../../../../src/domain/verifier/useCases/getRevokedAssertions';
import * as RequestServices from '../../../../../src/services/request';
import revokedAssertionsFixture from './fixtures/revokedAssertionsFixture';
import sinon from 'sinon';

describe('Verifier domain getRevokedAssertions use case test suite', function () {
  const errorMessageAssertion = 'Unable to get revocation assertions';
  let stubRequest;

  beforeEach(function () {
    stubRequest = sinon.stub(RequestServices, 'request').resolves(undefined);
  });

  afterEach(function () {
    stubRequest.restore();
  });

  describe('given it is called without an revocationListUrl parameter', function () {
    it('should throw an error', async function () {
      await getRevokedAssertions().catch(e => {
        expect(e.message).toBe(errorMessageAssertion);
      });
    });
  });

  describe('given it is called with an revocationListUrl', function () {
    const revokedAssertionsAssertionString = JSON.stringify(revokedAssertionsFixture);
    const issuerIdFixture = 'http://domain.tld/path';

    describe('and an assertionId', function () {
      it('should request the correct URL with the appended assertionId', async function () {
        stubRequest.resolves(revokedAssertionsAssertionString);
        const fixtureAssertionId = 'fixture-assertion-id';
        await getRevokedAssertions(issuerIdFixture, fixtureAssertionId);
        expect(stubRequest.getCall(0).args[0]).toEqual({
          url: 'http://domain.tld/path?assertionId=fixture-assertion-id'
        });
      });
    });

    describe('when the request is successful', function () {
      describe('and the response does not have revokedAssertions', function () {
        it('should return an empty array', async function () {
          const revokedAssertionsAssertionCopy = { ...revokedAssertionsFixture };
          delete revokedAssertionsAssertionCopy.revokedAssertions;
          stubRequest.resolves(JSON.stringify(revokedAssertionsAssertionCopy));
          const result = await getRevokedAssertions(issuerIdFixture);
          expect(result).toEqual([]);
        });
      });

      describe('and the response has revokedAssertions', function () {
        it('should return the revoked assertions JSON object', async function () {
          stubRequest.resolves(revokedAssertionsAssertionString);
          const result = await getRevokedAssertions(issuerIdFixture);
          expect(result).toEqual(revokedAssertionsFixture.revokedAssertions);
        });
      });
    });

    describe('when the request fails', function () {
      it('should throw an error', async function () {
        stubRequest.rejects(errorMessageAssertion);
        await getRevokedAssertions(issuerIdFixture).catch(e => {
          expect(e.message).toBe(errorMessageAssertion);
        });
      });
    });
  });
});
