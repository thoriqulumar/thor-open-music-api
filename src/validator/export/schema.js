const Joi = require('joi');

const PostExportPlaylistSchema = Joi.object({
  targetEmail: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
});

module.exports = {
  PostExportPlaylistSchema,
};
