class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, username, date, content, isDeleted, replies = [], likeCount = 0 } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = isDeleted ? '**komentar telah dihapus**' : content;
    this.replies = replies;
    this.likeCount = likeCount;
  }

  _verifyPayload({ id, username, date, content, isDeleted, replies, likeCount }) {
    if (!id || !username || !date || !content || isDeleted === undefined) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof username !== 'string' ||
      !(date instanceof Date) ||
      typeof content !== 'string' ||
      typeof isDeleted !== 'boolean' ||
      (replies !== undefined && !Array.isArray(replies)) ||
      (likeCount !== undefined && typeof likeCount !== 'number')
    ) {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailComment; 