class LikeUnlikeCommentUseCase {
  constructor({ 
    commentRepository, 
    commentLikesRepository, 
    threadRepository 
  }) {
    this._commentRepository = commentRepository;
    this._commentLikesRepository = commentLikesRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    const { threadId, commentId, owner } = useCasePayload;

    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);
    
    const isLiked = await this._commentLikesRepository.verifyLikeExists(commentId, owner);
    
    if (isLiked) {
      await this._commentLikesRepository.deleteLike(commentId, owner);
    } else {
      await this._commentLikesRepository.addLike(commentId, owner);
    }
  }

  _validatePayload(payload) {
    const { threadId, commentId, owner } = payload;
    
    if (!threadId || !commentId || !owner) {
      throw new Error('LIKE_UNLIKE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof commentId !== 'string' || typeof owner !== 'string') {
      throw new Error('LIKE_UNLIKE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = LikeUnlikeCommentUseCase;