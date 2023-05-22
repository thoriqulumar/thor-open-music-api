const autoBind = require('auto-bind');

class AuthenticationsHandler {
  constructor(service, userService, tokenManager, validator) {
    this._service = service;
    this._validator = validator;
    this._userService = userService;
    this._tokenManager = tokenManager;

    autoBind(this);
  }

  async postAuthenticationsHandler(request, h) {
    this._validator.validatePostAuthenticationPayload(request.payload);
    const { username, password } = request.payload;

    const id = await this._userService.verifyUserCredential(username, password);

    const accessToken = this._tokenManager.generateAccessToken({ id });
    const refreshToken = this._tokenManager.generateRefreshToken({ id });

    await this._service.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      message: 'Authentication successfully added',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  async putAuthenticationsHandler(request, h) {
    this._validator.validatePutAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this._service.verifyRefreshToken(refreshToken);
    const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = this._tokenManager.generateAccessToken({ id });

    const response = h.response({
      status: 'success',
      message: 'access token successfully renewed',
      data: {
        accessToken,
      },
    });
    response.code(200);
    return response;
  }

  async deleteAuthenticationsHandler(request, h) {
    this._validator.validateDeleteAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this._service.verifyRefreshToken(refreshToken);
    await this._service.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'refresh token successfully deleted',
    };
  }
}

module.exports = AuthenticationsHandler;
