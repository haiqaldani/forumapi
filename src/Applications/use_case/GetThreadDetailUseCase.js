class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
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
      
      comments.forEach(comment => {
        comment.replies = repliesGroupedByCommentId[comment.id] || [];
      });
    }
    
    thread.comments = comments;
    return thread;
  }
}

module.exports = GetThreadDetailUseCase; 