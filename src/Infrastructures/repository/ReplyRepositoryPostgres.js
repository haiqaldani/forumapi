const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const DetailReply = require('../../Domains/replies/entities/DetailReply');

class ReplyRepositoryPostgres {
  constructor(pool, idGenerator) {
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const { content, threadId, commentId, owner } = newReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date();

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, content, owner',
      values: [id, content, threadId, commentId, owner, date, false],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async verifyReplyAvailability(replyId) {
    const query = {
      text: 'SELECT 1 FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('reply tidak ditemukan');
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT 1 FROM replies WHERE id = $1 AND owner = $2',
      values: [replyId, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('anda tidak berhak mengakses resource ini');
    }
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async getRepliesByCommentIds(commentIds) {
    const query = {
      text: `SELECT 
              r.id,
              r.content,
              r.date,
              r.is_deleted,
              r.comment_id,
              u.username
            FROM replies r
            LEFT JOIN users u ON r.owner = u.id
            WHERE r.comment_id = ANY($1::text[])
            ORDER BY r.date ASC`,
      values: [commentIds],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => {
      const reply = new DetailReply({
        id: row.id,
        content: row.content,
        date: row.date,
        username: row.username,
        isDeleted: row.is_deleted,
      });
      reply.comment_id = row.comment_id;
      return reply;
    });
  }
}

module.exports = ReplyRepositoryPostgres; 