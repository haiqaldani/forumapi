class HelloHandler {
  constructor(container) {
    this._container = container;

    this.getHelloHandler = this.getHelloHandler.bind(this);
  }

  async getHelloHandler(request) {
    const { name } = request.query;
    
    if (!name) {
      return {
        status: 'fail',
        message: 'Name parameter is required',
      };
    }

    return {
      status: 'success',
      data: {
        message: `Hello, ${name}!`,
      },
    };
  }
}

module.exports = HelloHandler;