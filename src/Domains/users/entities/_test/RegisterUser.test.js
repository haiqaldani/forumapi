const RegisterUser = require('../RegisterUser');

describe('RegisterUser entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      username: 'dicoding',
      password: 'secret_password',
    };

    // Action & Assert
    expect(() => new RegisterUser(payload)).toThrowError('REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      username: 123,
      password: 'secret_password',
      fullname: 'Dicoding Indonesia',
    };

    // Action & Assert
    expect(() => new RegisterUser(payload)).toThrowError('REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when username contains more than 50 character', () => {
    // Arrange
    const payload = {
      username: 'dicodingindonesiadicodingindonesiadicodingindonesiadicoding',
      password: 'secret_password',
      fullname: 'Dicoding Indonesia',
    };

    // Action & Assert
    expect(() => new RegisterUser(payload)).toThrowError('REGISTER_USER.USERNAME_LIMIT_CHAR');
  });

  it('should throw error when username contains restricted character', () => {
    // Arrange
    const payload = {
      username: 'dicoding indonesia',
      password: 'secret_password',
      fullname: 'Dicoding Indonesia',
    };

    // Action & Assert
    expect(() => new RegisterUser(payload)).toThrowError('REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER');
  });

  it('should create RegisterUser entities correctly', () => {
    // Arrange
    const payload = {
      username: 'dicoding',
      password: 'secret_password',
      fullname: 'Dicoding Indonesia',
    };

    // Action
    const registerUser = new RegisterUser(payload);

    // Assert
    expect(registerUser).toBeInstanceOf(RegisterUser);
    expect(registerUser.username).toEqual(payload.username);
    expect(registerUser.password).toEqual(payload.password);
    expect(registerUser.fullname).toEqual(payload.fullname);
  });
});