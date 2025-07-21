const DetailComment = require('../DetailComment');

describe('DetailComment entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'johndoe',
      date: new Date(),
    };

    // Action & Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: true,
      username: {},
      date: 123,
      isDeleted: 'true',
    };

    // Action & Assert
    expect(() => new DetailComment(payload)).toThrowError('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailComment entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'johndoe',
      date: new Date('2023-01-01T00:00:00.000Z'),
      content: 'A comment',
      isDeleted: false,
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment).toBeInstanceOf(DetailComment);
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.content).toEqual(payload.content);
  });

  it('should create DetailComment entities with deleted content when isDeleted is true', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'johndoe',
      date: new Date('2023-01-01T00:00:00.000Z'),
      content: 'A comment',
      isDeleted: true,
    };

    // Action
    const detailComment = new DetailComment(payload);

    // Assert
    expect(detailComment).toBeInstanceOf(DetailComment);
    expect(detailComment.id).toEqual(payload.id);
    expect(detailComment.username).toEqual(payload.username);
    expect(detailComment.date).toEqual(payload.date);
    expect(detailComment.content).toEqual('**komentar telah dihapus**');
  });
}); 