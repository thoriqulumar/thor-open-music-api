const UploadHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'uploads',
  version: '1.0.0',
  register: async (
    server,
    { albumService, storageService, uploadsValidator }
  ) => {
    const uploadHandler = new UploadHandler(
      albumService,
      storageService,
      uploadsValidator
    );
    server.route(routes(uploadHandler));
  },
};
