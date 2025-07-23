class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository, commentLikesRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._commentLikesRepository = commentLikesRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getDetailThread(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    
    if (comments.length > 0) {
      const commentIds = comments.map(comment => comment.id);
      const replies = await this._replyRepository.getRepliesByCommentIds(commentIds);
      
      const repliesGroupedByCommentId = replies.reduce((acc, reply) => {
        if (!acc[reply.comment_id]) {
          acc[reply.comment_id] = [];
        }
        acc[reply.comment_id].push(reply);
        return acc;
      }, {});
      
      // Get like counts for all comments
      const commentLikeCounts = {};
      for (const comment of comments) {
        commentLikeCounts[comment.id] = await this._commentLikesRepository.getCommentLikeCount(comment.id);
      }
      
      // Set replies and like counts for each comment
      for (const comment of comments) {
        comment.replies = repliesGroupedByCommentId[comment.id] || [];
        // Create a new property since DetailComment objects are immutable after construction
        Object.defineProperty(comment, 'likeCount', {
          value: commentLikeCounts[comment.id],
          writable: false,
          enumerable: true,
          configurable: false
        });
      }
    }
    
    thread.comments = comments;
    return thread;
  }
}

module.exports = GetThreadDetailUseCase; 