const UsersService = require('../services/postgres/UsersService');

const userService = new UsersService();

const mapSongResult = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id,
});

const mapSongsResult = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
}) => ({
  id,
  title,
  performer,
});

const mapPlaylistResult = ({ id, name, owner, username }) => ({
  id,
  name,
  username,
});

const mapAlbumResult = ({ id, name, year, cover_url }) => ({
  id,
  name,
  year,
  coverUrl: cover_url,
});
module.exports = {
  mapSongResult,
  mapSongsResult,
  mapPlaylistResult,
  mapAlbumResult,
};
