const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapSongsResult, mapAlbumResult } = require('../../utils/mapResult');

class AlbumService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album~${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('fail to add album');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    const querySongs = {
      text: 'SELECT * FROM songs WHERE album_id = $1',
      values: [id],
    };

    if (!result.rows.length) {
      throw new NotFoundError('album not found');
    }
    const resultSongs = await this._pool.query(querySongs);
    const album = result.rows.map(mapAlbumResult);
    const songs = resultSongs.rows.map(mapSongsResult);

    album[0].songs = songs;

    return album[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('cannot update album, id not found');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('cannot delete album, id not found');
    }
  }

  async likeAlbum({ user_id, album_id }) {
    if (!(await this.getAlbumById(album_id))) {
      throw new NotFoundError('album is not found');
    }

    if (await this.checkExistingAlbumLikes(user_id, album_id)) {
      throw new InvariantError('user already like this album');
    }

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2) returning user_id',
      values: [user_id, album_id],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      throw new InvariantError('fail to like album');
    }
    await this._cacheService.delete(`albumLikes:${album_id}`);
  }

  async dislikeAlbum({ user_id, album_id }) {
    if (!(await this.getAlbumById(album_id))) {
      throw new NotFoundError('album is not found');
    }

    if (!(await this.checkExistingAlbumLikes(user_id, album_id))) {
      throw new InvariantError('user not liking this album');
    }

    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING user_id',
      values: [user_id, album_id],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      throw new InvariantError('fail to like album');
    }

    await this._cacheService.delete(`albumLikes:${album_id}`);
  }

  async getAlbumlikes(album_id) {
    try {
      const result = await this._cacheService.get(`albumLikes:${album_id}`);
      return { result: JSON.parse(result), isCache: true };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [album_id],
      };

      const result = await this._pool.query(query);
      await this._cacheService.set(
        `albumLikes:${album_id}`,
        JSON.stringify(result.rows[0])
      );
      return { result: result.rows[0], isCache: false };
    }
  }

  async checkExistingAlbumLikes(user_id, album_id) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [user_id, album_id],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      return false;
    }
    return true;
  }

  async addAlbumCover(id, fileLocation) {
    if (!(await this.getAlbumById(id))) {
      throw new NotFoundError('album is not found');
    }

    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [fileLocation, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      throw new InvariantError('fail to add cover album');
    }
  }
}

module.exports = AlbumService;
