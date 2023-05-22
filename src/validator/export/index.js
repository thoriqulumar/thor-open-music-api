const { PostExportPlaylistSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const ExportValidator = {
  validatePostExportPlaylistPayload: (payload) => {
    const validationResult = PostExportPlaylistSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportValidator;
