const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const pool = require('../../database/postgres/pool');
const AuthenticationRepositoryPostgres = require('../AuthenticationRepositoryPostgres');

describe('AuthenticationRepositoryPostgres', () => {
  afterEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addToken function', () => {
    it('should persist token correctly', async () => {
      // Arrange
      const token = 'refresh_token';
      const authenticationRepositoryPostgres = new AuthenticationRepositoryPostgres(pool);

      // Action
      await authenticationRepositoryPostgres.addToken(token);

      // Assert
      const tokens = await AuthenticationsTableTestHelper.findToken(token);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].token).toEqual(token);
    });
  });

  describe('checkAvailabilityToken function', () => {
    it('should throw InvariantError when token not available', async () => {
      // Arrange
      const authenticationRepositoryPostgres = new AuthenticationRepositoryPostgres(pool);

      // Action & Assert
      await expect(authenticationRepositoryPostgres.checkAvailabilityToken('non_existing_token'))
        .rejects.toThrowError(InvariantError);
    });

    it('should not throw InvariantError when token available', async () => {
      // Arrange
      const token = 'refresh_token';
      await AuthenticationsTableTestHelper.addToken(token);
      const authenticationRepositoryPostgres = new AuthenticationRepositoryPostgres(pool);

      // Action & Assert
      await expect(authenticationRepositoryPostgres.checkAvailabilityToken(token))
        .resolves.not.toThrowError(InvariantError);
    });
  });

  describe('deleteToken function', () => {
    it('should delete token correctly', async () => {
      // Arrange
      const token = 'refresh_token';
      await AuthenticationsTableTestHelper.addToken(token);
      const authenticationRepositoryPostgres = new AuthenticationRepositoryPostgres(pool);

      // Action
      await authenticationRepositoryPostgres.deleteToken(token);

      // Assert
      const tokens = await AuthenticationsTableTestHelper.findToken(token);
      expect(tokens).toHaveLength(0);
    });
  });
});