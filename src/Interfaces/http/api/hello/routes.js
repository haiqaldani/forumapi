const routes = (handler) => ([
  {
    method: 'GET',
    path: '/hello',
    handler: handler.getHelloHandler,
  },
]);

module.exports = routes;