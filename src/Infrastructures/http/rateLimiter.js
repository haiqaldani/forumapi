const rateLimitStore = new Map();

const rateLimiter = {
  name: 'rate-limiter',
  version: '1.0.0',
  register: async (server, options) => {
    const { max = 90, windowMs = 60000 } = options;

    server.ext('onRequest', (request, h) => {
      const { path, info } = request;
      
      if (!path.startsWith('/threads')) {
        return h.continue;
      }

      const clientIP = info.remoteAddress;
      const key = `${clientIP}:${path}`;
      const now = Date.now();

      let requestData = rateLimitStore.get(key);

      if (!requestData) {
        requestData = {
          count: 1,
          resetTime: now + windowMs,
        };
        rateLimitStore.set(key, requestData);
        return h.continue;
      }

      if (now > requestData.resetTime) {
        requestData.count = 1;
        requestData.resetTime = now + windowMs;
        rateLimitStore.set(key, requestData);
        return h.continue;
      }

      if (requestData.count >= max) {
        const resetTime = Math.ceil((requestData.resetTime - now) / 1000);
        const response = h.response({
          status: 'fail',
          message: `Rate limit exceeded. Too many requests to /threads endpoints. Please try again in ${resetTime} seconds.`,
        });
        response.code(429);
        response.header('X-RateLimit-Limit', max);
        response.header('X-RateLimit-Remaining', 0);
        response.header('X-RateLimit-Reset', new Date(requestData.resetTime).toISOString());
        return response.takeover();
      }

      requestData.count++;
      rateLimitStore.set(key, requestData);

      const remaining = max - requestData.count;
      request.headers['x-ratelimit-limit'] = max;
      request.headers['x-ratelimit-remaining'] = remaining;
      request.headers['x-ratelimit-reset'] = new Date(requestData.resetTime).toISOString();

      return h.continue;
    });

    setInterval(() => {
      const now = Date.now();
      for (const [key, data] of rateLimitStore.entries()) {
        if (now > data.resetTime + windowMs) {
          rateLimitStore.delete(key);
        }
      }
    }, windowMs);
  },
};

module.exports = rateLimiter;