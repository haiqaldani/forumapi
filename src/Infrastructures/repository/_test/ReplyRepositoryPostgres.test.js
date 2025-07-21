const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist new reply and return added reply correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const newReply = new AddReply({
        content: 'A reply',
        threadId: 'thread-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(reply).toHaveLength(1);
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'A reply',
        owner: 'user-123',
      }));
    });
  });

  describe('verifyReplyAvailability function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyAvailability('reply-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyAvailability('reply-123'))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when reply not owned by user', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-456'))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when reply owned by user', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123'))
        .resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReply function', () => {
    it('should update is_deleted to true in database', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReply('reply-123');

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(reply[0].is_deleted).toEqual(true);
    });
  });

  describe('getRepliesByCommentIds function', () => {
    it('should return empty array when no replies exist', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds(['comment-123']);

      // Assert
      expect(replies).toEqual([]);
    });

    it('should return all replies correctly', async () => {
      // Arrange
      const firstUser = { id: 'user-123', username: 'johndoe' };
      const secondUser = { id: 'user-456', username: 'janedoe' };
      const thread = { id: 'thread-123', owner: 'user-123' };
      const comment = { id: 'comment-123', threadId: 'thread-123', owner: 'user-123' };
      const firstReply = {
        id: 'reply-123',
        content: 'First reply',
        commentId: 'comment-123',
        owner: 'user-123',
        date: new Date('2023-01-01T00:00:00.000Z'),
      };
      const secondReply = {
        id: 'reply-456',
        content: 'Second reply',
        commentId: 'comment-123',
        owner: 'user-456',
        date: new Date('2023-01-02T00:00:00.000Z'),
      };

      await UsersTableTestHelper.addUser(firstUser);
      await UsersTableTestHelper.addUser(secondUser);
      await ThreadsTableTestHelper.addThread(thread);
      await CommentsTableTestHelper.addComment(comment);
      await RepliesTableTestHelper.addReply(firstReply);
      await RepliesTableTestHelper.addReply(secondReply);

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds(['comment-123']);

      // Assert
      expect(replies).toHaveLength(2);
      expect(replies[0]).toBeInstanceOf(DetailReply);
      expect(replies[0].id).toEqual(firstReply.id);
      expect(replies[0].content).toEqual(firstReply.content);
      expect(replies[0].username).toEqual(firstUser.username);
      expect(replies[0].date).toEqual(firstReply.date);
      expect(replies[1]).toBeInstanceOf(DetailReply);
      expect(replies[1].id).toEqual(secondReply.id);
      expect(replies[1].content).toEqual(secondReply.content);
      expect(replies[1].username).toEqual(secondUser.username);
      expect(replies[1].date).toEqual(secondReply.date);
    });

    it('should return correct content when reply is deleted', async () => {
      // Arrange
      const user = { id: 'user-123', username: 'johndoe' };
      const thread = { id: 'thread-123', owner: 'user-123' };
      const comment = { id: 'comment-123', threadId: 'thread-123', owner: 'user-123' };
      const reply = {
        id: 'reply-123',
        content: 'A reply',
        commentId: 'comment-123',
        owner: 'user-123',
        isDeleted: true,
      };

      await UsersTableTestHelper.addUser(user);
      await ThreadsTableTestHelper.addThread(thread);
      await CommentsTableTestHelper.addComment(comment);
      await RepliesTableTestHelper.addReply(reply);

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentIds(['comment-123']);

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0]).toBeInstanceOf(DetailReply);
      expect(replies[0].id).toEqual(reply.id);
      expect(replies[0].content).toEqual('**balasan telah dihapus**');
      expect(replies[0].username).toEqual(user.username);
      expect(replies[0].date).toBeDefined();
    });
  });
}); 