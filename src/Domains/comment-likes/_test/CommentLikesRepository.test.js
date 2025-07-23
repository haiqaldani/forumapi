const CommentLikesRepository = require('../CommentLikesRepository');

describe('CommentLikesRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    const commentLikesRepository = new CommentLikesRepository();

    await expect(commentLikesRepository.toggleCommentLike({})).rejects.toThrowError('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentLikesRepository.verifyCommentLikeExistence('', '')).rejects.toThrowError('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentLikesRepository.getCommentLikeCount('')).rejects.toThrowError('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});