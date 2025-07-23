/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentLikesTableTestHelper = {
  async addCommentLike({
    commentId = 'comment-123',
    owner = 'user-123',
  }) {
    const query = {
      text: 'INSERT INTO comment_likes(comment_id, owner) VALUES($1, $2)',
      values: [commentId, owner],
    };

    await pool.query(query);
  },

  async findCommentLikeByCommentIdAndOwner(commentId, owner) {
    const query = {
      text: 'SELECT * FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async getCommentLikeCount(commentId) {
    const query = {
      text: 'SELECT COUNT(*) FROM comment_likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await pool.query(query);
    return parseInt(result.rows[0].count, 10);
  },

  async cleanTable() {
    await pool.query('DELETE FROM comment_likes WHERE 1=1');
  },
};

module.exports = CommentLikesTableTestHelper;