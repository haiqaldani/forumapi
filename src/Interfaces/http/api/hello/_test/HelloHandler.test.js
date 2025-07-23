const container = require('../../../../../Infrastructures/container');
const createServer = require('../../../../../Infrastructures/http/createServer');

describe('/hello endpoint', () => {
  describe('when GET /hello', () => {
    it('should response 200 and return hello message when name is provided', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/hello?name=World',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.message).toEqual('Hello, World!');
    });

    it('should response 200 and return hello message with different name', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/hello?name=John',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.message).toEqual('Hello, John!');
    });

    it('should response 200 and handle special characters in name', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/hello?name=Alice%20Smith',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data).toBeDefined();
      expect(responseJson.data.message).toEqual('Hello, Alice Smith!');
    });

    it('should response 200 with fail status when name parameter is missing', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/hello',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Name parameter is required');
      expect(responseJson.data).toBeUndefined();
    });

    it('should response 200 with fail status when name parameter is empty', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/hello?name=',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Name parameter is required');
      expect(responseJson.data).toBeUndefined();
    });
  });
});