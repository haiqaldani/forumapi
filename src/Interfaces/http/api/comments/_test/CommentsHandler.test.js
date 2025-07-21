const pool = require('../../../../../Infrastructures/database/postgres/pool');
const UsersTableTestHelper = require('../../../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../../../tests/CommentsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../../../../Infrastructures/container');
const createServer = require('../../../../../Infrastructures/http/createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'A comment',
      };

      const server = await createServer(container);

      // add user
      const userPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      console.log('User Payload:', userPayload);
      const userResponse = await server.inject({
        method: 'POST',
        url: '/users',
        payload: userPayload,
      });
      console.log('User Response:', userResponse.payload);

      // login user
      const loginPayload = {
        username: 'dicoding',
        password: 'secret',
      };
      console.log('Login Payload:', loginPayload);
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: loginPayload,
      });
      console.log('Login Response:', loginResponse.payload);
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // add thread
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'A thread',
          body: 'A thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { id: threadId } = JSON.parse(threadResponse.payload).data.addedThread;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const commentResponseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(commentResponseJson.status).toEqual('success');
      expect(commentResponseJson.data.addedComment).toBeDefined();
      expect(commentResponseJson.data.addedComment.id).toBeDefined();
      expect(commentResponseJson.data.addedComment.content).toEqual(requestPayload.content);
      expect(commentResponseJson.data.addedComment.owner).toBeDefined();
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'A comment',
      };

      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const errorResponseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(errorResponseJson.status).toEqual('fail');
      expect(errorResponseJson.message).toBeDefined();
    });

    it('should response 401 when request without authentication', async () => {
      // Arrange
      const requestPayload = {
        content: 'A comment',
      };

      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and delete comment', async () => {
      // Arrange
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // add thread
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'A thread',
          body: 'A thread body',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { id: threadId } = JSON.parse(threadResponse.payload).data.addedThread;

      // add comment
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'A comment',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const { id: commentId } = JSON.parse(commentResponse.payload).data.addedComment;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const deleteResponseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(deleteResponseJson.status).toEqual('success');
    });

    it('should response 403 when user is not the comment owner', async () => {
      // Arrange
      const server = await createServer(container);

      // add first user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // add second user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'johndoe',
          password: 'secret',
          fullname: 'John Doe',
        },
      });

      // login first user
      const firstLoginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { data: { accessToken: firstAccessToken } } = JSON.parse(firstLoginResponse.payload);

      // login second user
      const secondLoginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'johndoe',
          password: 'secret',
        },
      });
      const { data: { accessToken: secondAccessToken } } = JSON.parse(secondLoginResponse.payload);

      // add thread
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'A thread',
          body: 'A thread body',
        },
        headers: {
          Authorization: `Bearer ${firstAccessToken}`,
        },
      });
      const { id: threadId } = JSON.parse(threadResponse.payload).data.addedThread;

      // add comment
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'A comment',
        },
        headers: {
          Authorization: `Bearer ${firstAccessToken}`,
        },
      });
      const { id: commentId } = JSON.parse(commentResponse.payload).data.addedComment;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${secondAccessToken}`,
        },
      });

      // Assert
      const forbiddenResponseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(forbiddenResponseJson.status).toEqual('fail');
      expect(forbiddenResponseJson.message).toBeDefined();
    });

    it('should response 404 when thread or comment not found', async () => {
      // Arrange
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });

      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const notFoundResponseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(notFoundResponseJson.status).toEqual('fail');
      expect(notFoundResponseJson.message).toBeDefined();
    });

    it('should response 401 when request without authentication', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });
  });
}); 