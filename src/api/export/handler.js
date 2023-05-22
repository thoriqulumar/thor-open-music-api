const autoBind = require('auto-bind');

class ExportHandler {
  constructor(service, validator, playlistService) {
    this._service = service;
    this._validator = validator;
    this._playlistService = playlistService;

    autoBind(this);
  }

  async postExportPlaylistHandler(request, h) {
    this._validator.validatePostExportPlaylistPayload(request.payload);
    const { playlistId } = request.params;
    const { targetEmail } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);

    const message = {
      playlistId,
      userId: credentialId,
      targetEmail,
    };

    await this._service.sendMessage('export:playlist', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });

    response.code(201);

    return response;
  }
}

module.exports = ExportHandler;
