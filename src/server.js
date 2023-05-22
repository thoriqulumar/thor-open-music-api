require('dotenv').config();
const ClientError = require('./exceptions/ClientError');
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const path = require('path');
const Inert = require('@hapi/inert');
const config = require('./utils/config');

//album
const albums = require('./api/album');
const AlbumService = require('./services/postgres/AlbumService');
const AlbumValidator = require('./validator/album');

//song
const songs = require('./api/song');
const SongService = require('./services/postgres/SongService');
const SongValidator = require('./validator/song');

//user
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

//playlist
const playlist = require('./api/playlist');
const PlaylistService = require('./services/postgres/PlaylistService');
const PlaylistValidator = require('./validator/playlist');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// export
const exportData = require('./api/export');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportValidator = require('./validator/export');

// upload
const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/storage');

// cache
const CacheService = require('./services/redis/CacheService');

const init = async () => {
  const cacheService = new CacheService();
  const albumService = new AlbumService(cacheService);
  const songService = new SongService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistService = new PlaylistService();
  const storageService = new StorageService(
    path.resolve(__dirname, 'api/uploads/file/images')
  );

  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('open_music_jwt', 'jwt', {
    keys: config.auth.accessTokenKey,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.auth.accessTokenAge,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: `"I'm sorry, something happened in our server :(`,
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.register([
    {
      plugin: albums,
      options: {
        albumService: albumService,
        albumValidator: AlbumValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songService,
        validator: SongValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlist,
      options: {
        playlistService: playlistService,
        songService: songService,
        userService: usersService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: exportData,
      options: {
        service: ProducerService,
        validator: ExportValidator,
        playlistService: playlistService,
      },
    },
    {
      plugin: uploads,
      options: {
        albumService: albumService,
        storageService: storageService,
        uploadsValidator: UploadsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server is running at ${server.info.uri}`);
};

init();
