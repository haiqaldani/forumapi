const NewAuth = require('../NewAuth');

describe('NewAuth entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      accessToken: 'access_token',
    };

    // Action & Assert
    expect(() => new NewAuth(payload)).toThrowError('NEW_AUTH.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      accessToken: 123,
      refreshToken: true,
    };

    // Action & Assert
    expect(() => new NewAuth(payload)).toThrowError('NEW_AUTH.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewAuth entities correctly', () => {
    // Arrange
    const payload = {
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    };

    // Action
    const newAuth = new NewAuth(payload);

    // Assert
    expect(newAuth).toBeInstanceOf(NewAuth);
    expect(newAuth.accessToken).toEqual(payload.accessToken);
    expect(newAuth.refreshToken).toEqual(payload.refreshToken);
  });
});