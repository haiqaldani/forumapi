const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadDetail = require('../../../Domains/threads/entities/ThreadDetail');
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
    const expectedThreadDetail = new ThreadDetail({
      id: 'thread-123',
      title: 'A thread',
      body: 'A thread body',
      date: fixedDate,
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'johndoe',
          date: fixedDate,
          content: 'A comment',
          isDeleted: false,
          replies: [],
        },
      ],
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getDetailThread = jest.fn(() => Promise.resolve({
      id: 'thread-123',
      title: 'A thread',
      body: 'A thread body',
      date: fixedDate,
      username: 'dicoding',
    }));
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve([
      {
        id: 'comment-123',
        username: 'johndoe',
        date: fixedDate,
        content: 'A comment',
        isDeleted: false,
      },
    ]));
    mockReplyRepository.getRepliesByCommentIds = jest.fn(() => Promise.resolve([]));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(threadDetail).toStrictEqual(expectedThreadDetail);
    expect(mockThreadRepository.getDetailThread).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(threadId);
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


    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getDetailThread = jest.fn(() => Promise.resolve({
      id: threadId,
      title: 'A thread',
      body: 'A thread body',
      date: fixedDate,
      username: 'dicoding',
    }));
    
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve([
      {
        id: 'comment-123',
        username: 'johndoe',
        date: fixedDate,
        content: 'First comment',
        isDeleted: false,
      },
      {
        id: 'comment-124',
        username: 'janedoe',
        date: fixedDate,
        content: 'Second comment',
        isDeleted: false,
      },
    ]));
    
    mockReplyRepository.getRepliesByCommentIds = jest.fn(() => Promise.resolve(mockRepliesData));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
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
    expect(threadDetail.comments[0].replies[0].id).toBe('reply-123');
    expect(threadDetail.comments[0].replies[0].content).toBe('A reply');
    expect(threadDetail.comments[0].replies[1].id).toBe('reply-124');
    expect(threadDetail.comments[0].replies[1].content).toBe('Another reply');
    
    expect(threadDetail.comments[1].id).toBe('comment-124');
    expect(threadDetail.comments[1].username).toBe('janedoe');
    expect(threadDetail.comments[1].content).toBe('Second comment');
    expect(threadDetail.comments[1].replies).toHaveLength(1);
    expect(threadDetail.comments[1].replies[0].id).toBe('reply-125');
    expect(threadDetail.comments[1].replies[0].content).toBe('Reply to another comment');
    expect(mockReplyRepository.getRepliesByCommentIds).toHaveBeenCalledWith(['comment-123', 'comment-124']);
  });

  it('should handle thread with no comments correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const fixedDate = createFixedDate();

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.getDetailThread = jest.fn(() => Promise.resolve({
      id: threadId,
      title: 'A thread with no comments',
      body: 'A thread body',
      date: fixedDate,
      username: 'dicoding',
    }));

    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve([]));

    mockReplyRepository.getRepliesByCommentIds = jest.fn();

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const threadDetail = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(threadDetail.id).toBe(threadId);
    expect(threadDetail.title).toBe('A thread with no comments');
    expect(threadDetail.comments).toHaveLength(0);
    expect(mockThreadRepository.getDetailThread).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByCommentIds).not.toHaveBeenCalled();
  });
});