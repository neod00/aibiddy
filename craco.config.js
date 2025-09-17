const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Node.js polyfills
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser.js'),
        util: require.resolve('util/'),
        url: require.resolve('url/'),
        path: require.resolve('path-browserify'),
        os: require.resolve('os-browserify/browser'),
        querystring: require.resolve('querystring-es3'),
        zlib: require.resolve('browserify-zlib'),
        https: require.resolve('https-browserify'),
        http: require.resolve('stream-http'),
        assert: require.resolve('assert/'),
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        http2: false,
      };
      
      // Alias 설정
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'node:buffer': 'buffer',
        'node:process': 'process/browser.js',
        'node:util': 'util/',
        'node:url': 'url/',
        'node:path': 'path-browserify',
        'node:os': 'os-browserify/browser',
        'node:querystring': 'querystring-es3',
        'node:zlib': 'browserify-zlib',
        'node:https': 'https-browserify',
        'node:http': 'stream-http',
        'node:assert': 'assert/',
      };
      
      // Module rules
      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      });

      // node: 스키마 처리
      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              '@babel/plugin-syntax-import-meta',
              ['@babel/plugin-proposal-optional-chaining', { loose: true }],
              ['@babel/plugin-proposal-nullish-coalescing-operator', { loose: true }],
            ],
          },
        },
        resolve: {
          fullySpecified: false,
        },
      });
      
      // 성능 최적화 설정
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      };
      
      // Plugins
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser.js',
          Buffer: ['buffer', 'Buffer'],
        }),
      ];
      
      return webpackConfig;
    },
  },
};
