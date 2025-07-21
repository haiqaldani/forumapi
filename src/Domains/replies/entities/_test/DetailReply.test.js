const DetailReply = require('../DetailReply');

describe('DetailReply entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'A reply',
      date: new Date(),
      username: 'dicoding',
    };

    // Action & Assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload does not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 'A reply',
      date: new Date(),
      username: 'dicoding',
      isDeleted: false,
    };

    // Action & Assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailReply entities correctly when not deleted', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'A reply',
      date: new Date(),
      username: 'dicoding',
      isDeleted: false,
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply).toBeInstanceOf(DetailReply);
    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.content).toEqual(payload.content);
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.username).toEqual(payload.username);
  });

  it('should create DetailReply entities correctly when deleted', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'A reply',
      date: new Date(),
      username: 'dicoding',
      isDeleted: true,
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply).toBeInstanceOf(DetailReply);
    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.content).toEqual('**balasan telah dihapus**');
    expect(detailReply.date).toEqual(payload.date);
    expect(detailReply.username).toEqual(payload.username);
  });
});