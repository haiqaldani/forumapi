const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrating the get thread detail action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const mockDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'A thread',
      body: 'A thread body',
      date: new Date(),
      username: 'dicoding',
      comments: [],
    });

    const mockComments = [
      {
        id: 'comment-123',
        username: 'johndoe',
        date: new Date(),
        content: 'A comment',
        replies: [],
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getDetailThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockDetailThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComments));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
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