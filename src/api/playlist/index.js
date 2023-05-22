const PlaylistHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlist',
  version: '1.0.0',
  register: async (server, { playlistService, songService, userService, validator }) => {
    const playlistHandler = new PlaylistHandler(playlistService, songService, userService, validator);
    server.route(routes(playlistHandler));
  },
};
