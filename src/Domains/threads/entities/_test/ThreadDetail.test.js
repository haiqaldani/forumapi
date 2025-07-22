const ThreadDetail = require('../ThreadDetail');

describe('a ThreadDetail entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
    };

    // Action and Assert
    expect(() => new ThreadDetail(payload)).toThrow('THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:59:16.198Z',
      username: 'dicoding',
      comments: [],
    };

    // Action and Assert
    expect(() => new ThreadDetail(payload)).toThrow('THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create threadDetail object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: new Date('2021-08-08T07:59:16.198Z'),
      username: 'dicoding',
      comments: [],
    };

    // Action
    const threadDetail = new ThreadDetail(payload);

    // Assert
    expect(threadDetail.id).toEqual(payload.id);
    expect(threadDetail.title).toEqual(payload.title);
    expect(threadDetail.body).toEqual(payload.body);
    expect(threadDetail.date).toEqual(payload.date);
    expect(threadDetail.username).toEqual(payload.username);
    expect(threadDetail.comments).toEqual([]);
  });

  it('should map comments and replies correctly with deleted content handling', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: new Date('2021-08-08T07:59:16.198Z'),
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'johndoe',
          date: new Date('2021-08-08T07:59:16.198Z'),
          content: 'sebuah comment',
          isDeleted: false,
          replies: [
            {
              id: 'reply-123',
              content: 'sebuah balasan',
              date: new Date('2021-08-08T07:59:16.198Z'),
              username: 'dicoding',
              isDeleted: false,
            },
            {
              id: 'reply-456',
              content: 'balasan yang dihapus',
              date: new Date('2021-08-08T07:59:16.198Z'),
              username: 'johndoe',
              isDeleted: true,
            },
          ],
        },
        {
          id: 'comment-456',
          username: 'johndoe',
          date: new Date('2021-08-08T07:59:16.198Z'),
          content: 'comment yang dihapus',
          isDeleted: true,
          replies: [],
        },
      ],
    };

    // Action
    const threadDetail = new ThreadDetail(payload);

    // Assert
    expect(threadDetail.comments).toHaveLength(2);
    expect(threadDetail.comments[0].content).toEqual('sebuah comment');
    expect(threadDetail.comments[0].replies).toHaveLength(2);
    expect(threadDetail.comments[0].replies[0].content).toEqual('sebuah balasan');
    expect(threadDetail.comments[0].replies[1].content).toEqual('**balasan telah dihapus**');
    expect(threadDetail.comments[1].content).toEqual('**komentar telah dihapus**');
  });
});