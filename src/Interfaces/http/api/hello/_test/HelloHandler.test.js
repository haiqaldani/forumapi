const HelloHandler = require('../handler');

describe('HelloHandler', () => {
  it('should response with success status and hello message', async () => {
    // Arrange
    const container = {};
    const helloHandler = new HelloHandler(container);

    // Action
    const response = await helloHandler.getHelloHandler();

    // Assert
    expect(response.status).toEqual('success');
    expect(response.message).toEqual('Hello World!');
  });
});