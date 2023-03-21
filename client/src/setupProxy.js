const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use((req, res, next) => {
    if (req.path.includes('/socket.io') || req.path.includes('/api')) {
      createProxyMiddleware({
        target: `http://localhost:${process.env.PORT || 5000}`,
        changeOrigin: true,
      })(req, res, next);
    } else {
      next();
    }
  });
};
