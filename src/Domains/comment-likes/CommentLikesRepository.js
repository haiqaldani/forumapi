class CommentLikesRepository {
  async toggleCommentLike(commentLike) {
    throw new Error('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyCommentLikeExistence(commentId, owner) {
    throw new Error('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getCommentLikeCount(commentId) {
    throw new Error('COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = CommentLikesRepository;