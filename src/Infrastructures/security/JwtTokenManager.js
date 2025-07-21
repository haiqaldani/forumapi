const Jwt = require('@hapi/jwt');
const InvariantError = require('../../Commons/exceptions/InvariantError');
const AuthenticationTokenManager = require('../../Applications/security/AuthenticationTokenManager');

class JwtTokenManager extends AuthenticationTokenManager {
  constructor() {
    super();
    this._accessTokenKey = process.env.ACCESS_TOKEN_KEY;
    this._refreshTokenKey = process.env.REFRESH_TOKEN_KEY;
  }

  async createAccessToken(payload) {
    return Jwt.token.generate(payload, this._accessTokenKey);
  }

  async createRefreshToken(payload) {
    return Jwt.token.generate(payload, this._refreshTokenKey);
  }

  async verifyRefreshToken(token) {
    try {
      const artifacts = Jwt.token.decode(token);
      Jwt.token.verify(artifacts, this._refreshTokenKey);
    } catch (error) {
      throw new InvariantError('refresh token tidak valid');
    }
  }

  async decodePayload(token) {
    const artifacts = Jwt.token.decode(token);
    return artifacts.decoded.payload;
  }
}

module.exports = JwtTokenManager; 