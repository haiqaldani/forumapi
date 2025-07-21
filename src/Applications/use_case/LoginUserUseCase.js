const UserLogin = require('../../Domains/users/entities/UserLogin');
const NewAuth = require('../../Domains/authentications/entities/NewAuth');

class LoginUserUseCase {
  constructor({
    userRepository,
    authenticationRepository,
    tokenManager,
    passwordHash,
  }) {
    this._userRepository = userRepository;
    this._authenticationRepository = authenticationRepository;
    this._tokenManager = tokenManager;
    this._passwordHash = passwordHash;
  }

  async execute(useCasePayload) {
    const { username, password } = new UserLogin(useCasePayload);

    const encryptedPassword = await this._userRepository.getPasswordByUsername(username);

    await this._passwordHash.comparePassword(password, encryptedPassword);

    const id = await this._userRepository.getIdByUsername(username);

    const accessToken = await this._tokenManager.createAccessToken({ username, id });
    const refreshToken = await this._tokenManager.createRefreshToken({ username, id });

    const newAuth = new NewAuth({
      accessToken,
      refreshToken,
    });

    await this._authenticationRepository.addToken(newAuth.refreshToken);

    return newAuth;
  }
}

module.exports = LoginUserUseCase; 