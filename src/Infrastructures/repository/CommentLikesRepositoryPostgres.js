const CommentLikesRepository = require('../../Domains/comment-likes/CommentLikesRepository');

class CommentLikesRepositoryPostgres extends CommentLikesRepository {
  constructor(pool) {
    super();
    this._pool = pool;
  }

  async toggleCommentLike(commentLike) {
    const { commentId, owner } = commentLike;

    const checkQuery = {
      text: 'SELECT id FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const checkResult = await this._pool.query(checkQuery);

    if (checkResult.rowCount > 0) {
      const deleteQuery = {
        text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND owner = $2',
        values: [commentId, owner],
      };
      await this._pool.query(deleteQuery);
    } else {
      const insertQuery = {
        text: 'INSERT INTO comment_likes (comment_id, owner) VALUES ($1, $2)',
        values: [commentId, owner],
      };
      await this._pool.query(insertQuery);
    }
  }

  async verifyCommentLikeExistence(commentId, owner) {
    const query = {
      text: 'SELECT id FROM comment_likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async getCommentLikeCount(commentId) {
    const query = {
      text: 'SELECT COUNT(*) FROM comment_likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = CommentLikesRepositoryPostgres;