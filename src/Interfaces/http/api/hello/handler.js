class HelloHandler {
  constructor(container) {
    this._container = container;

    this.getHelloHandler = this.getHelloHandler.bind(this);
  }

  async getHelloHandler() {
    return {
      status: 'success',
      message: 'Hello World!',
    };
  }
}

module.exports = HelloHandler;