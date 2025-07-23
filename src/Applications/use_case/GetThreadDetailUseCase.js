const ThreadDetail = require('../../Domains/threads/entities/ThreadDetail');

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
      for (const comment of comments) {
        comment.replies = repliesGroupedByCommentId[comment.id] || [];
        comment.likeCount = await this._commentLikesRepository.getLikeCountByCommentId(comment.id);
      }
    }
    
    return new ThreadDetail({
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments,
    });
  }
}

module.exports = GetThreadDetailUseCase; 