exports.up = (pgm) => {
  pgm.createTable('comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('comment_likes', 'fk_comment_likes.comment_id_comments.id', {
    foreignKeys: {
      columns: 'comment_id',
      references: 'comments(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('comment_likes', 'fk_comment_likes.owner_users.id', {
    foreignKeys: {
      columns: 'owner',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });

  pgm.addConstraint('comment_likes', 'unique_comment_user_like', {
    unique: ['comment_id', 'owner'],
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('comment_likes', 'fk_comment_likes.comment_id_comments.id');
  pgm.dropConstraint('comment_likes', 'fk_comment_likes.owner_users.id');
  pgm.dropConstraint('comment_likes', 'unique_comment_user_like');
  pgm.dropTable('comment_likes');
};