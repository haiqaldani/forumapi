const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const fixedDate = new Date('2023-01-01T00:00:00.000Z');
    const mockDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'A thread',
      body: 'A thread body',
      date: fixedDate,
      username: 'dicoding',
      comments: [],
    });

    const mockComments = [
      new DetailComment({
        id: 'comment-123',
        username: 'johndoe',
        date: fixedDate,
        content: 'A comment',
        isDeleted: false,
        replies: [],
      }),
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getDetailThread = jest.fn()
      .mockImplementation(() => Promise.resolve(new DetailThread({
        id: 'thread-123',
        title: 'A thread',
        body: 'A thread body',
        date: fixedDate,
        username: 'dicoding',
        comments: [],
      })));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        new DetailComment({
          id: 'comment-123',
          username: 'johndoe',
          date: fixedDate,
          content: 'A comment',
          isDeleted: false,
          replies: [],
        }),
      ]));
    mockReplyRepository.getRepliesByCommentIds = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(threadDetail.id).toEqual(mockDetailThread.id);
    expect(threadDetail.title).toEqual(mockDetailThread.title);
    expect(threadDetail.body).toEqual(mockDetailThread.body);
    expect(threadDetail.date).toEqual(mockDetailThread.date);
    expect(threadDetail.username).toEqual(mockDetailThread.username);
    expect(threadDetail.comments).toEqual(mockComments);
    expect(mockThreadRepository.getDetailThread).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
  });
});