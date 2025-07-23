const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentLike = require('../../../Domains/comment-likes/entities/CommentLike');
const CommentLikesRepository = require('../../../Domains/comment-likes/CommentLikesRepository');
const pool = require('../../database/postgres/pool');
const CommentLikesRepositoryPostgres = require('../CommentLikesRepositoryPostgres');

describe('CommentLikesRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('should be instance of CommentLikesRepository domain', () => {
    const commentLikesRepositoryPostgres = new CommentLikesRepositoryPostgres({}, {});

    expect(commentLikesRepositoryPostgres).toBeInstanceOf(CommentLikesRepository);
  });

  describe('toggleCommentLike function', () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
    });

    afterEach(async () => {
      await CommentLikesTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    it('should add comment like when user has not liked the comment', async () => {
      const commentLike = new CommentLike({
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const commentLikesRepositoryPostgres = new CommentLikesRepositoryPostgres(pool);

      await commentLikesRepositoryPostgres.toggleCommentLike(commentLike);

      const commentLikes = await CommentLikesTableTestHelper.findCommentLikeByCommentIdAndOwner('comment-123', 'user-123');
      expect(commentLikes).toHaveLength(1);
    });

    it('should remove comment like when user has already liked the comment', async () => {
      const commentLike = new CommentLike({
        commentId: 'comment-123',
        owner: 'user-123',
      });

      await CommentLikesTableTestHelper.addCommentLike({
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const commentLikesRepositoryPostgres = new CommentLikesRepositoryPostgres(pool);

      await commentLikesRepositoryPostgres.toggleCommentLike(commentLike);

      const commentLikes = await CommentLikesTableTestHelper.findCommentLikeByCommentIdAndOwner('comment-123', 'user-123');
      expect(commentLikes).toHaveLength(0);
    });
  });

  describe('verifyCommentLikeExistence function', () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-456', owner: 'user-456' });
      await CommentsTableTestHelper.addComment({ id: 'comment-456', threadId: 'thread-456', owner: 'user-456' });
    });

    afterEach(async () => {
      await CommentLikesTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    it('should return true when comment like exists', async () => {
      await CommentLikesTableTestHelper.addCommentLike({
        commentId: 'comment-456',
        owner: 'user-456',
      });

      const commentLikesRepositoryPostgres = new CommentLikesRepositoryPostgres(pool);

      const result = await commentLikesRepositoryPostgres.verifyCommentLikeExistence('comment-456', 'user-456');

      expect(result).toBe(true);
    });

    it('should return false when comment like does not exist', async () => {
      const commentLikesRepositoryPostgres = new CommentLikesRepositoryPostgres(pool);

      const result = await commentLikesRepositoryPostgres.verifyCommentLikeExistence('comment-456', 'user-456');

      expect(result).toBe(false);
    });
  });

  describe('getCommentLikeCount function', () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: 'user-789', username: 'alice' });
      await UsersTableTestHelper.addUser({ id: 'user-790', username: 'bob' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-789', owner: 'user-789' });
      await CommentsTableTestHelper.addComment({ id: 'comment-789', threadId: 'thread-789', owner: 'user-789' });
    });

    afterEach(async () => {
      await CommentLikesTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    it('should return correct like count for comment', async () => {
      await CommentLikesTableTestHelper.addCommentLike({
        commentId: 'comment-789',
        owner: 'user-789',
      });
      await CommentLikesTableTestHelper.addCommentLike({
        commentId: 'comment-789',
        owner: 'user-790',
      });

      const commentLikesRepositoryPostgres = new CommentLikesRepositoryPostgres(pool);

      const likeCount = await commentLikesRepositoryPostgres.getCommentLikeCount('comment-789');

      expect(likeCount).toBe(2);
    });

    it('should return 0 when comment has no likes', async () => {
      const commentLikesRepositoryPostgres = new CommentLikesRepositoryPostgres(pool);

      const likeCount = await commentLikesRepositoryPostgres.getCommentLikeCount('comment-789');

      expect(likeCount).toBe(0);
    });
  });
});