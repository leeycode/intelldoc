const path = require('path');

module.exports = {
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  devServer: {
    port: 8080,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    },
    contentBase: [
      path.join(__dirname, 'node_modules/x-data-spreadsheet/dist')
    ],
    contentBasePublicPath: ['/node_modules/x-data-spreadsheet/dist']
  },
  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true
      },
      sass: {
        implementation: require('sass')
      }
    }
  },
  chainWebpack: config => {
    // 设置别名
    config.resolve.alias
      .set('@', path.join(__dirname, 'src'))
      
    // SVG 处理
    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();
    svgRule
      .oneOf('inline')
      .resourceQuery(/inline/)
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
      .end()
      .end()
      .oneOf('external')
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/[name].[hash:8].[ext]',
      });
    
    // 添加对.ico文件的支持
    config.module
      .rule('ico')
      .test(/\.(ico|cur)$/i)
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/[name].[hash:8].[ext]'
      })
      .end();
    
    // 添加对更多字体和图像文件的支持
    config.module
      .rule('fonts-and-images')
      .test(/\.(woff2?|eot|ttf|otf|png|jpe?g|gif|webp)$/i)
      .use('url-loader')
      .loader('file-loader')
      .options({
        limit: 10000,
        name: 'assets/[name].[hash:8].[ext]'
      })
      .end();
    
    // 复制静态资源
    config.plugin('copy')
      .tap(args => {
        args[0].push({
          from: path.resolve(__dirname, 'src/assets/docs'),
          to: path.resolve(__dirname, 'dist/static/docs')
        });
        
        // 添加X-Spreadsheet资源复制
        args[0].push({
          from: path.resolve(__dirname, 'node_modules/x-data-spreadsheet/dist'),
          to: path.resolve(__dirname, 'dist/x-spreadsheet')
        });
        args[0].push({
          from: path.resolve(__dirname, 'node_modules/x-data-spreadsheet/dist'),
          to: path.resolve(__dirname, 'public/x-spreadsheet')
        });
        return args;
      });

    // Babel 转译支持
    config.module
      .rule('js')
      .test(/\.js$/)
      .exclude
        .add(/node_modules/)
        .end()
      .use('babel-loader')
        .loader('babel-loader')
        .end();

    // 文档文件处理
    config.module
      .rule('documents')
      .test(/\.(docx|xlsx)$/)
      .use('file-loader')
        .loader('file-loader')
        .options({
          name: '[name].[ext]',
          outputPath: 'assets/docs/'
        })
        .end();
        
    // 配置 terser-webpack-plugin
    config.optimization.minimizer('terser').tap((args) => {
      args[0].terserOptions = {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log']
        },
        format: {
          comments: false
        }
      };
      args[0].extractComments = false;
      return args;
    });
  },
  // 添加代码分割配置，确保生成的JS文件小于1MB
  configureWebpack: {
    output: {
      // 强制 chunk 名称中包含文件 hash，确保缓存更新
      chunkFilename: 'static/js/[name].[chunkhash:8].js'
    },
    optimization: {
      // 启用所有类型的代码分割优化
      runtimeChunk: 'single',
      moduleIds: 'hashed',
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity, // 增加允许的初始请求数量
        maxAsyncRequests: Infinity, // 增加允许的异步请求数量
        maxSize: 200 * 1024, // 降低限制到200KB，强制更细粒度分割
        minSize: 10000, // 降低最小块大小以允许更小的块
        automaticNameDelimiter: '~',
        cacheGroups: {
          default: false,
          vendors: false,
          // 所有 node_modules 模块按包名分割
          vendor: {
            name(module) {
              // 获取模块的包名
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              // 创建具有特定包名的块名
              const chunkName = packageName.replace('@', '').split('/').join('-');
              // 通过添加前缀将块按类别分组
              return `npm.${chunkName}.${Math.random().toString(36).substr(2, 8)}`;
            },
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'all',
            reuseExistingChunk: true
          },
          // 通用模块
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            chunks: 'initial',
            reuseExistingChunk: true
          },
          // ant-design-vue 单独处理
          antdesign: {
            name(module) {
              const match = module.context.match(/[\\/]node_modules[\\/]ant-design-vue[\\/](.*?)([\\/]|$)/);
              const subModuleName = match ? match[1] : 'base';
              // 添加随机后缀以生成不同文件
              return `antd.${subModuleName}.${Math.random().toString(36).substr(2, 8)}`;
            },
            test: /[\\/]node_modules[\\/]ant-design-vue[\\/]/,
            priority: 20,
            chunks: 'all',
            reuseExistingChunk: true
          },
          // vue-office 超细粒度拆分
          vueOfficeComponentsDocx: {
            name(module) {
              // 获取更深层的路径以便更细粒度拆分
              const fullPath = module.context;
              const hash = require('crypto').createHash('md5').update(fullPath).digest('hex').substr(0, 8);
              return `vo-docx.${hash}`;
            },
            test: /[\\/]node_modules[\\/]@vue-office[\\/]docx[\\/]/,
            priority: 40,
            chunks: 'all',
            enforce: true // 强制创建块，即使不满足最小大小
          },
          vueOfficeComponentsExcel: {
            name(module) {
              const fullPath = module.context;
              const hash = require('crypto').createHash('md5').update(fullPath).digest('hex').substr(0, 8);
              return `vo-excel.${hash}`;
            },
            test: /[\\/]node_modules[\\/]@vue-office[\\/]excel[\\/]/,
            priority: 40,
            chunks: 'all',
            enforce: true
          },
          vueOfficeComponentsPptx: {
            name(module) {
              const fullPath = module.context;
              const hash = require('crypto').createHash('md5').update(fullPath).digest('hex').substr(0, 8);
              return `vo-pptx.${hash}`;
            },
            test: /[\\/]node_modules[\\/]@vue-office[\\/]pptx[\\/]/,
            priority: 40,
            chunks: 'all',
            enforce: true
          },
          // 其他 vue-office 相关资源
          vueOfficeCommon: {
            name(module) {
              const fullPath = module.context;
              const hash = require('crypto').createHash('md5').update(fullPath).digest('hex').substr(0, 8);
              return `vo-common.${hash}`;
            },
            test: /[\\/]node_modules[\\/]@vue-office[\\/](?!docx|excel|pptx).*[\\/]/,
            priority: 30,
            chunks: 'all',
            enforce: true
          },
          // X-Spreadsheet相关资源
          xspreadsheet: {
            name(module) {
              const fullPath = module.context;
              const hash = require('crypto').createHash('md5').update(fullPath).digest('hex').substr(0, 8);
              return `xspreadsheet.${hash}`;
            },
            test: /[\\/]node_modules[\\/]x-data-spreadsheet[\\/]/,
            priority: 25,
            chunks: 'all',
            enforce: true
          }
        }
      }
    },
    // 设置性能提示为false，避免webpack默认的大小警告
    performance: {
      hints: false
    }
  }
}; 