const DetailComment = require('../../comments/entities/DetailComment');
const DetailReply = require('../../replies/entities/DetailReply');

class ThreadDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, title, body, date, username, comments = [] } = payload;

    this.id = id;
    this.title = title;
    this.body = body;
    this.date = date;
    this.username = username;
    this.comments = this._mapComments(comments);
  }

  _mapComments(comments) {
    return comments.map(comment => {
      const mappedComment = new DetailComment({
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: comment.content,
        isDeleted: comment.isDeleted,
      });

      if (comment.replies && comment.replies.length > 0) {
        mappedComment.replies = comment.replies.map(reply => new DetailReply({
          id: reply.id,
          content: reply.content,
          date: reply.date,
          username: reply.username,
          isDeleted: reply.isDeleted,
        }));
      }

      return mappedComment;
    });
  }

  _verifyPayload({ id, title, body, date, username, comments }) {
    if (!id || !title || !body || !date || !username) {
      throw new Error('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof title !== 'string' ||
      typeof body !== 'string' ||
      !(date instanceof Date) ||
      typeof username !== 'string' ||
      (comments !== undefined && !Array.isArray(comments))
    ) {
      throw new Error('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ThreadDetail;