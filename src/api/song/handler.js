const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { title, year, genre, performer, duration, albumId } =
      request.payload;

    const songId = await this._service.addSong({
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    });

    const response = h.response({
      status: 'success',
      message: 'song successfully added',
      data: {
        songId: songId,
      },
    });

    response.code(201);

    return response;
  }

  async getSongsHandler(request, h) {
    const queryString = request.query;
    const songs = await this._service.getSongs(queryString);
    const response = h.response({
      status: 'success',
      data: {
        songs,
      },
    });

    response.code(200);

    return response;
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);

    const response = h.response({
      status: 'success',
      data: {
        song: song,
      },
    });

    response.code(200);

    return response;
  }

  async putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;
    const song = await this._service.editSongById(id, request.payload);

    const response = h.response({
      status: 'success',
      message: 'song successfully edited',
    });

    response.code(200);

    return response;
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;
    const song = await this._service.deleteSongById(id);

    const response = h.response({
      status: 'success',
      message: 'song successfully deleted',
    });

    response.code(200);

    return response;
  }
}

module.exports = SongsHandler;
