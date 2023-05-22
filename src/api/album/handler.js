const autoBind = require('auto-bind');
const config = require('../../utils/config');
class AlbumsHandler {
  constructor(albumService, albumValidator) {
    this._albumService = albumService;
    this._albumValidator = albumValidator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._albumValidator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._albumService.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'album successfully added',
      data: {
        albumId: albumId,
      },
    });

    response.code(201);

    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const album = await this._albumService.getAlbumById(id);
    const response = h.response({
      status: 'success',
      data: {
        album: album,
      },
    });
    response.code(200);
    return response;
  }

  async putAlbumByIdHandler(request, h) {
    this._albumValidator.validateAlbumPayload(request.payload);
    const { id } = request.params;
    const albumId = await this._albumService.editAlbumById(id, request.payload);

    const response = h.response({
      status: 'success',
      message: 'album successfully edited',
    });

    response.code(200);

    return response;
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;
    await this._albumService.deleteAlbumById(id);

    const response = h.response({
      status: 'success',
      message: 'album successfully deleted',
    });

    response.code(200);

    return response;
  }

  async postAlbumLikesHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._albumService.likeAlbum({
      user_id: credentialId,
      album_id: id,
    });

    const response = h.response({
      status: 'success',
      message: 'album successfully liked',
    });

    response.code(201);
    return response;
  }

  async deleteAlbumLikesHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._albumService.dislikeAlbum({
      user_id: credentialId,
      album_id: id,
    });

    const response = h.response({
      status: 'success',
      message: 'album successfully dislike',
    });

    response.code(200);
    return response;
  }

  async getAlbumLikesHandler(request, h) {
    const { id } = request.params;

    const { result, isCache } = await this._albumService.getAlbumlikes(id);

    const response = h.response({
      status: 'success',
      data: {
        likes: parseInt(result.count),
      },
    });
    if (isCache) {
      response.header('X-Data-Source', 'cache');
    }
    response.code(200);
    return response;
  }
}

module.exports = AlbumsHandler;
