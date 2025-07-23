const CommentLike = require('../../Domains/comment-likes/entities/CommentLike');

class ToggleCommentLikeUseCase {
  constructor({ threadRepository, commentRepository, commentLikesRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._commentLikesRepository = commentLikesRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, owner } = useCasePayload;
    
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId);
    
    const commentLike = new CommentLike({ commentId, owner });
    await this._commentLikesRepository.toggleCommentLike(commentLike);
  }
}

module.exports = ToggleCommentLikeUseCase;