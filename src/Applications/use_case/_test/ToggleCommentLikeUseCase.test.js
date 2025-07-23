const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentLikesRepository = require('../../../Domains/comment-likes/CommentLikesRepository');
const CommentLike = require('../../../Domains/comment-likes/entities/CommentLike');
const ToggleCommentLikeUseCase = require('../ToggleCommentLikeUseCase');

describe('ToggleCommentLikeUseCase', () => {
  it('should orchestrating the toggle comment like action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockCommentLikesRepository = new CommentLikesRepository();

    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentLikesRepository.toggleCommentLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const toggleCommentLikeUseCase = new ToggleCommentLikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      commentLikesRepository: mockCommentLikesRepository,
    });

    await toggleCommentLikeUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyThreadAvailability)
      .toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentAvailability)
      .toHaveBeenCalledWith(useCasePayload.commentId);
    expect(mockCommentLikesRepository.toggleCommentLike)
      .toHaveBeenCalledWith(new CommentLike({
        commentId: useCasePayload.commentId,
        owner: useCasePayload.owner,
      }));
  });
});