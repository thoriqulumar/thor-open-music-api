/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('playlists', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'VARCHAR(50)',
      unique: true,
      notNull: true,
    },
    owner: {
      type: 'TEXT',
      notNull: true,
    },
  });
  pgm.addConstraint('playlists', 'unique_id', 'UNIQUE(id)');

  pgm.addConstraint(
    'playlists',
    'fk_playlists.owner_users.id',
    'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE'
  );
};

exports.down = (pgm) => {
  pgm.dropTable('playlists');
};
