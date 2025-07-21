const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });

      const newThread = new AddThread({
        title: 'A thread',
        body: 'A thread body',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(thread).toHaveLength(1);
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'A thread',
        owner: 'user-123',
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return thread correctly when thread exists', async () => {
      // Arrange
      const threadData = {
        id: 'thread-123',
        title: 'A thread',
        body: 'A thread body',
        owner: 'user-123',
        date: new Date('2023-01-01T00:00:00.000Z'),
      };

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread(threadData);

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(thread.id).toEqual(threadData.id);
      expect(thread.title).toEqual(threadData.title);
      expect(thread.body).toEqual(threadData.body);
      expect(thread.owner).toEqual(threadData.owner);
      expect(thread.date).toEqual(threadData.date);
    });
  });

  describe('verifyThreadAvailability function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadAvailability('thread-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyThreadAvailability('thread-123'))
        .resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getDetailThread function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getDetailThread('thread-123'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return thread detail correctly when thread exists', async () => {
      // Arrange
      const user = { id: 'user-123', username: 'johndoe' };
      const threadData = {
        id: 'thread-123',
        title: 'A thread',
        body: 'A thread body',
        owner: 'user-123',
        date: new Date('2023-01-01T00:00:00.000Z'),
      };

      await UsersTableTestHelper.addUser(user);
      await ThreadsTableTestHelper.addThread(threadData);

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const threadDetail = await threadRepositoryPostgres.getDetailThread('thread-123');

      // Assert
      expect(threadDetail).toBeInstanceOf(DetailThread);
      expect(threadDetail.id).toEqual(threadData.id);
      expect(threadDetail.title).toEqual(threadData.title);
      expect(threadDetail.body).toEqual(threadData.body);
      expect(threadDetail.username).toEqual(user.username);
      expect(threadDetail.date).toEqual(threadData.date);
      expect(threadDetail.comments).toEqual([]);
    });
  });
});