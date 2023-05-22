const autoBind = require('auto-bind');

class PlaylistHandler {
  constructor(playlistService, songService, userService, validator) {
    this._playlistService = playlistService;
    this._songService = songService;
    this._userService = userService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const user = await this._userService.getUserById(credentialId);
    const username = user.username;
    const playlistId = await this._playlistService.addPlaylist({
      name,
      owner: credentialId,
      username,
    });

    const response = h.response({
      status: 'success',
      message: 'playlist successfully added',
      data: {
        playlistId: playlistId,
      },
    });

    response.code(201);

    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._playlistService.getPlaylists(credentialId);

    const response = h.response({
      status: 'success',
      data: {
        playlists: playlists,
      },
    });
    response.code(200);
    return response;
  }

  async deletePlaylistHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(id, credentialId);
    await this._playlistService.deletePlaylistById(id);

    const response = h.response({
      status: 'success',
      message: 'playlist successfully deleted',
    });

    response.code(200);
    return response;
  }

  async postSongIntoPlaylistHandler(request, h) {
    this._validator.validatePostSongIntoPlaylistPayload(request.payload);
    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(id, credentialId);
    await this._songService.verifySongById(songId);
    await this._playlistService.addSongIntoPlaylist(songId, id);

    const response = h.response({
      status: 'success',
      message: 'song successfully added into playlist',
    });

    response.code(201);

    return response;
  }

  async getSongsByPlaylistIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistService.verifyPlaylistOwner(id, credentialId);

    const playlist = await this._playlistService.getPlaylistById(
      id,
      credentialId
    );
    console.log(playlist);
    const songs = await this._playlistService.getSongsByPlaylistId(id);
    console.log(songs);
    const songsPair = { songs: songs };

    const resultPlaylist = { ...playlist, ...songsPair };

    const response = h.response({
      status: 'success',
      data: {
        playlist: resultPlaylist,
      },
    });

    response.code(200);

    return response;
  }

  async deleteSongInPlaylistHandler(request, h) {
    this._validator.validatePostSongIntoPlaylistPayload(request.payload);
    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(id, credentialId);
    await this._playlistService.deleteSongInPlaylist(songId, id);

    const response = h.response({
      status: 'success',
      message: 'song successfully deleted from playlist',
    });

    response.code(200);

    return response;
  }
}

module.exports = PlaylistHandler;
