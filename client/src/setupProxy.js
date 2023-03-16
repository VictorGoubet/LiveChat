const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use('',
    createProxyMiddleware({
      target: `http://localhost:${process.env.PORT || 5000}`,
      changeOrigin: true,
    })
  );
};