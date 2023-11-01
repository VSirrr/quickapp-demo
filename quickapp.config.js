const path = require('path')
function resolve(p) {
 return path.join(__dirname,p)
}
module.exports = {
    // hap命令构建时的配置参数
    cli: {
        splitChunksMode: 'SMART',
        // enableE2e: true
    },
    // 采用webpack编译时的配置
    webpack: {
      resolve: {
        extensions: ['.ux'],
        alias: {
          'assets': resolve('src/assets'),
          'vConsole': resolve('src/vConsole'),
          'components': resolve('src/components'),
        }
      },
      // module: {
      //   rules: [
      //     {
      //       test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      //       use: [
      //         {
      //           loader: 'url-loader',
      //           options: {
      //             limit: 10000
      //           }
      //         }
      //       ]
      //     }
      //   ]
      // },
      // plugins: [
      //   // webpack插件示例
      //   new WebpackPluginDemo(),
      //   // 自动替换代码中的变量
      //   new webpack.DefinePlugin({
      //     ENV_TYPE: process.env.type
      //   })
      // ]
    }
  }
  
  // class WebpackPluginDemo {
  //   apply(compiler) {
  //     compiler.hooks.emit.tapAsync('WebpackPluginDemo', function(
  //       compilation,
  //       callback
  //     ) {
  //       callback()
  //     })
  //   }
  // }