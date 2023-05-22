const Jwt = require('@hapi/jwt');
const InvariantError = require('../exceptions/InvariantError');
const config = require('../utils/config');
const TokenManager = {
  generateAccessToken: (payload) =>
    Jwt.token.generate(payload, config.auth.accessTokenKey),
  generateRefreshToken: (payload) =>
    Jwt.token.generate(payload, config.auth.refreshTokenKey),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, config.auth.refreshTokenKey);
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError('refresh token is not valid');
    }
  },
};

module.exports = TokenManager;
