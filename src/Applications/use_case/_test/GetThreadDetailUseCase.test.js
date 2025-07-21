const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');

describe('GetThreadDetailUseCase', () => {
  /**
   * Menghindari duplikasi date string dengan membuat helper function
   */
  const createFixedDate = () => new Date('2023-01-01T00:00:00.000Z');

  it('should create valid date object for testing', () => {
    // Arrange & Action
    const fixedDate = createFixedDate();

    // Assert
    expect(fixedDate).toBeInstanceOf(Date);
    expect(fixedDate.toISOString()).toBe('2023-01-01T00:00:00.000Z');
  });

  it('should orchestrating the get thread detail action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const fixedDate = createFixedDate();
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

  it('should group replies by comment_id correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const fixedDate = createFixedDate();
    
    const mockReplies = [
      {
        id: 'reply-123',
        comment_id: 'comment-123',
        content: 'A reply',
        date: fixedDate,
        username: 'jane',
        isDeleted: false,
      },
      {
        id: 'reply-124',
        comment_id: 'comment-123',
        content: 'Another reply',
        date: fixedDate,
        username: 'john',
        isDeleted: false,
      },
      {
        id: 'reply-125',
        comment_id: 'comment-124',
        content: 'Reply to another comment',
        date: fixedDate,
        username: 'bob',
        isDeleted: false,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getDetailThread = jest.fn()
      .mockImplementation(() => Promise.resolve(new DetailThread({
        id: threadId,
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
          content: 'First comment',
          isDeleted: false,
          replies: [],
        }),
        new DetailComment({
          id: 'comment-124',
          username: 'janedoe',
          date: fixedDate,
          content: 'Second comment',
          isDeleted: false,
          replies: [],
        }),
      ]));
    
    mockReplyRepository.getRepliesByCommentIds = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReplies));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(threadDetail.comments).toHaveLength(2);
    expect(threadDetail.comments[0].replies).toHaveLength(2);
    expect(threadDetail.comments[1].replies).toHaveLength(1);
    expect(threadDetail.comments[0].replies).toEqual([mockReplies[0], mockReplies[1]]);
    expect(threadDetail.comments[1].replies).toEqual([mockReplies[2]]);
    expect(mockReplyRepository.getRepliesByCommentIds).toBeCalledWith(['comment-123', 'comment-124']);
  });
});