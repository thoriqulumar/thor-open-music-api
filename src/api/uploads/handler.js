const autoBind = require('auto-bind');
const config = require('../../utils/config');
class AlbumsHandler {
  constructor(albumService, storageService, uploadsValidator) {
    this._albumService = albumService;
    this._storageService = storageService;
    this._uploadsValidator = uploadsValidator;

    autoBind(this);
  }

  async postAlbumCoverHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;

    this._uploadsValidator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const fileLocation = `http://${config.app.host}:${config.app.port}/upload/images/${filename}`;
    await this._albumService.addAlbumCover(id, fileLocation);
    const response = h.response({
      status: 'success',
      message: 'album cover successfully uploaded',
    });

    response.code(201);

    return response;
  }
}

module.exports = AlbumsHandler;
