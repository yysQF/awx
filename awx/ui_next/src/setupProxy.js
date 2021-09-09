const { createProxyMiddleware } = require('http-proxy-middleware');

const TARGET = process.env.TARGET || 'http://localhost:82';

module.exports = app => {
  // app.use(
  //   createProxyMiddleware(['/api', '/websocket', '/sso'], {
  //     target: TARGET,
  //     secure: false,
  //     ws: true,
  //   })
  app.use(createProxyMiddleware('/api', {
    target: TARGET,
    secure: false,
    changeOrigin: true,
    pathRewrite: {
      "^/api": "/api"
    }
  }))
};
