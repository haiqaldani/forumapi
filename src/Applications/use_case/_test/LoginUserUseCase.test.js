const LoginUserUseCase = require('../LoginUserUseCase');
const UserRepository = require('../../../Domains/users/UserRepository');
const AuthenticationRepository = require('../../../Domains/authentications/AuthenticationRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const PasswordHash = require('../../security/PasswordHash');
const NewAuth = require('../../../Domains/authentications/entities/NewAuth');

describe('LoginUserUseCase', () => {
  it('should orchestrating the login user action correctly', async () => {
    // Arrange
    const useCasePayload = {
      username: 'dicoding',
      password: 'secret_password',
    };

    const expectedAuthentication = new NewAuth({
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    });

    /** creating dependency of use case */
    const mockUserRepository = new UserRepository();
    const mockAuthenticationRepository = new AuthenticationRepository();
    const mockTokenManager = new AuthenticationTokenManager();
    const mockPasswordHash = new PasswordHash();

    /** mocking needed function */
    mockUserRepository.getPasswordByUsername = jest.fn()
      .mockImplementation(() => Promise.resolve('encrypted_password'));
    mockPasswordHash.comparePassword = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockUserRepository.getIdByUsername = jest.fn()
      .mockImplementation(() => Promise.resolve('user-123'));
    mockTokenManager.createAccessToken = jest.fn()
      .mockImplementation(() => Promise.resolve('access_token'));
    mockTokenManager.createRefreshToken = jest.fn()
      .mockImplementation(() => Promise.resolve('refresh_token'));
    mockAuthenticationRepository.addToken = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const loginUserUseCase = new LoginUserUseCase({
      userRepository: mockUserRepository,
      authenticationRepository: mockAuthenticationRepository,
      tokenManager: mockTokenManager,
      passwordHash: mockPasswordHash,
    });

    // Action
    const authentication = await loginUserUseCase.execute(useCasePayload);

    // Assert
    expect(authentication).toStrictEqual(expectedAuthentication);
    expect(mockUserRepository.getPasswordByUsername).toBeCalledWith(useCasePayload.username);
    expect(mockPasswordHash.comparePassword).toBeCalledWith(useCasePayload.password, 'encrypted_password');
    expect(mockUserRepository.getIdByUsername).toBeCalledWith(useCasePayload.username);
    expect(mockTokenManager.createAccessToken).toBeCalledWith({ username: useCasePayload.username, id: 'user-123' });
    expect(mockTokenManager.createRefreshToken).toBeCalledWith({ username: useCasePayload.username, id: 'user-123' });
    expect(mockAuthenticationRepository.addToken).toBeCalledWith('refresh_token');
  });
});