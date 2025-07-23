const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentLikesRepository = require('../../../Domains/comment-likes/CommentLikesRepository');
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
      comments: [],
    });

    const expectedComments = [
      new DetailComment({
        id: 'comment-123',
        username: 'johndoe',
        date: fixedDate,
        content: 'A comment',
        isDeleted: false,
        likeCount: 0,
      }),
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockCommentLikesRepository = new CommentLikesRepository();

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
        }),
      ]));
    mockReplyRepository.getRepliesByCommentIds = jest.fn()
      .mockImplementation(() => Promise.resolve([]));
    mockCommentLikesRepository.getCommentLikeCount = jest.fn()
      .mockImplementation(() => Promise.resolve(0));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      commentLikesRepository: mockCommentLikesRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expectedComments.forEach(comment => {
      comment.replies = [];
    });
    expectedDetailThread.comments = expectedComments;
    expect(threadDetail).toStrictEqual(expectedDetailThread);
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

    const expectedReplies = mockRepliesData.map(reply => {
      const detailReply = new DetailReply({
        id: reply.id,
        content: reply.content,
        date: reply.date,
        username: reply.username,
        isDeleted: reply.isDeleted,
      });
      detailReply.comment_id = reply.comment_id;
      return detailReply;
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockCommentLikesRepository = new CommentLikesRepository();

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
          likeCount: 2,
        }),
        new DetailComment({
          id: 'comment-124',
          username: 'janedoe',
          date: fixedDate,
          content: 'Second comment',
          isDeleted: false,
          likeCount: 2,
        }),
      ]));
    
    mockCommentLikesRepository.getCommentLikeCount = jest.fn()
      .mockImplementation(() => Promise.resolve(2));
    
    mockReplyRepository.getRepliesByCommentIds = jest.fn()
      .mockImplementation(() => Promise.resolve(mockRepliesData.map(reply => {
        const detailReply = new DetailReply({
          id: reply.id,
          content: reply.content,
          date: reply.date,
          username: reply.username,
          isDeleted: reply.isDeleted,
        });
        detailReply.comment_id = reply.comment_id;
        return detailReply;
      })));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      commentLikesRepository: mockCommentLikesRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(threadDetail.id).toBe(threadId);
    expect(threadDetail.title).toBe('A thread');
    expect(threadDetail.body).toBe('A thread body');
    expect(threadDetail.date).toStrictEqual(fixedDate);
    expect(threadDetail.username).toBe('dicoding');
    expect(threadDetail.comments).toHaveLength(2);
    
    expect(threadDetail.comments[0].id).toBe('comment-123');
    expect(threadDetail.comments[0].username).toBe('johndoe');
    expect(threadDetail.comments[0].content).toBe('First comment');
    expect(threadDetail.comments[0].replies).toHaveLength(2);
    expect(threadDetail.comments[0].replies[0]).toStrictEqual(expectedReplies[0]);
    expect(threadDetail.comments[0].replies[1]).toStrictEqual(expectedReplies[1]);
    
    expect(threadDetail.comments[1].id).toBe('comment-124');
    expect(threadDetail.comments[1].username).toBe('janedoe');
    expect(threadDetail.comments[1].content).toBe('Second comment');
    expect(threadDetail.comments[1].replies).toHaveLength(1);
    expect(threadDetail.comments[1].replies[0]).toStrictEqual(expectedReplies[2]);
    expect(mockReplyRepository.getRepliesByCommentIds).toBeCalledWith(['comment-123', 'comment-124']);
  });

  it('should handle thread with no comments correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const fixedDate = createFixedDate();

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockCommentLikesRepository = new CommentLikesRepository();

    mockThreadRepository.getDetailThread = jest.fn()
      .mockImplementation(() => Promise.resolve(new DetailThread({
        id: threadId,
        title: 'A thread with no comments',
        body: 'A thread body',
        date: fixedDate,
        username: 'dicoding',
        comments: [],
      })));

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    mockReplyRepository.getRepliesByCommentIds = jest.fn();
    mockCommentLikesRepository.getCommentLikeCount = jest.fn();

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      commentLikesRepository: mockCommentLikesRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(threadDetail.id).toBe(threadId);
    expect(threadDetail.title).toBe('A thread with no comments');
    expect(threadDetail.comments).toHaveLength(0);
    expect(mockThreadRepository.getDetailThread).toBeCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByCommentIds).not.toHaveBeenCalled();
  });
});