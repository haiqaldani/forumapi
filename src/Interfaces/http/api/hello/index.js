const HelloHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'hello',
  version: '1.0.0',
  register: async (server, { container }) => {
    const helloHandler = new HelloHandler(container);
    server.route(routes(helloHandler));
  },
};