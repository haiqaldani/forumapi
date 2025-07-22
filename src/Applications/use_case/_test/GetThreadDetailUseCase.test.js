const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');

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
    const expectedDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'A thread',
      body: 'A thread body',
      date: fixedDate,
      username: 'dicoding',
    });

    const expectedComments = [
      new DetailComment({
        id: 'comment-123',
        username: 'johndoe',
        date: fixedDate,
        content: 'A comment',
        isDeleted: false,
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
      })));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        new DetailComment({
          id: 'comment-123',
          username: 'johndoe',
          date: fixedDate,
          content: 'A comment',
          isDeleted: false,
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
    expect(threadDetail).toStrictEqual({
      ...expectedDetailThread,
      comments: expectedComments.map(comment => ({
        ...comment,
        replies: [],
      })),
    });
    expect(mockThreadRepository.getDetailThread).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
  });

  it('should group replies by comment_id correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const fixedDate = createFixedDate();
    
    const mockRepliesData = [
      {
        id: 'reply-123',
        content: 'A reply',
        date: fixedDate,
        username: 'jane',
        isDeleted: false,
        comment_id: 'comment-123',
      },
      {
        id: 'reply-124',
        content: 'Another reply',
        date: fixedDate,
        username: 'john',
        isDeleted: false,
        comment_id: 'comment-123',
      },
      {
        id: 'reply-125',
        content: 'Reply to another comment',
        date: fixedDate,
        username: 'bob',
        isDeleted: false,
        comment_id: 'comment-124',
      },
    ];

    const expectedReplies = mockRepliesData.map(reply => new DetailReply({
      id: reply.id,
      content: reply.content,
      date: reply.date,
      username: reply.username,
      isDeleted: reply.isDeleted,
    }));

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
      })));
    
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        new DetailComment({
          id: 'comment-123',
          username: 'johndoe',
          date: fixedDate,
          content: 'First comment',
          isDeleted: false,
        }),
        new DetailComment({
          id: 'comment-124',
          username: 'janedoe',
          date: fixedDate,
          content: 'Second comment',
          isDeleted: false,
        }),
      ]));
    
    mockReplyRepository.getRepliesByCommentIds = jest.fn()
      .mockImplementation(() => Promise.resolve(mockRepliesData.map(reply => new DetailReply({
        id: reply.id,
        content: reply.content,
        date: reply.date,
        username: reply.username,
        isDeleted: reply.isDeleted,
      }))));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    const expectedThread = {
      id: threadId,
      title: 'A thread',
      body: 'A thread body',
      date: fixedDate,
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'johndoe',
          date: fixedDate,
          content: 'First comment',
          isDeleted: false,
          replies: [expectedReplies[0], expectedReplies[1]],
        },
        {
          id: 'comment-124',
          username: 'janedoe',
          date: fixedDate,
          content: 'Second comment',
          isDeleted: false,
          replies: [expectedReplies[2]],
        },
      ],
    };

    expect(threadDetail).toStrictEqual(expectedThread);
    expect(mockReplyRepository.getRepliesByCommentIds).toBeCalledWith(['comment-123', 'comment-124']);
  });
});