const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // 나라장터 API 프록시
  app.use(
    '/api/nara',
    createProxyMiddleware({
      target: 'https://apis.data.go.kr',
      changeOrigin: true,
      pathRewrite: {
        '^/api/nara': '/1230000/ad/BidPublicInfoService'
      },
      onProxyReq: (proxyReq, req, res) => {
        // CORS 헤더 추가
        proxyReq.setHeader('Origin', 'https://apis.data.go.kr');
      },
      onProxyRes: (proxyRes, req, res) => {
        // CORS 헤더 추가
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      }
    })
  );
};
