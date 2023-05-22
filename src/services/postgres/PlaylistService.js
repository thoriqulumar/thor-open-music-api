const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const { mapSongsResult, mapPlaylistResult } = require('../../utils/mapResult');

class PlaylistService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner, username }) {
    const id = `playlist~${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, name, owner, username],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('fail to add playlist');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = `SELECT * FROM playlists WHERE owner='${owner}'`;

    const result = await this._pool.query(query);

    return result.rows.map(mapPlaylistResult);
  }

  async getPlaylistById(idPlaylist, owner) {
    const query = `SELECT * FROM playlists WHERE owner='${owner}' AND id='${idPlaylist}'`;
    const result = await this._pool.query(query);
    return result.rows.map(mapPlaylistResult)[0];
  }

  async deletePlaylistById(id) {
    const query = `DELETE FROM playlists WHERE id='${id}' RETURNING id`;
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('playlist failed to deleted, not found');
    }
  }

  async addSongIntoPlaylist(idSong, idPlaylist) {
    const id = `plylst_song~${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, idPlaylist, idSong],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('fail to add song into playlist');
    }

    return result.rows[0].id;
  }

  async getSongsByPlaylistId(idPlaylist) {
    const query = `SELECT song_id FROM playlists_songs WHERE playlist_id='${idPlaylist}'`;

    const result = await this._pool.query(query);

    var listDetailSong = [];
    for (var i = 0; i < result.rows.length; i++) {
      const querySong = `SELECT * FROM songs WHERE id = '${result.rows[i].song_id}'`;
      const detailSong = await this._pool.query(querySong);
      listDetailSong.push(detailSong.rows.map(mapSongsResult)[0]);
    }

    return listDetailSong;
  }

  async deleteSongInPlaylist(idSong, idPlaylist) {
    const query = `DELETE FROM playlists_songs WHERE playlist_id = '${idPlaylist}' AND song_id = '${idSong}' RETURNING id`;

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('cannot delete song, id not found');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = `SELECT * FROM playlists WHERE id = '${id}'`;
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('playlists not found');
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError("you don't have access to this playlist");
    }
  }
}

module.exports = PlaylistService;
