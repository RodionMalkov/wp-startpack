const path = require('path')
const fs = require('fs')
const pkg = require('./package.json')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development'
  const isProd = argv.mode === 'production'

  // страницы (pug → html)
  const pagesDir = path.resolve(__dirname, 'src/app/pages')
  const pages = fs
    .readdirSync(pagesDir)
    .filter(file => file.endsWith('.pug'))

  const htmlPlugins = pages.map(
    page =>
      new HtmlWebpackPlugin({
        template: path.join(pagesDir, page),
        filename: `front/${page.replace('.pug', '.html')}`,
        inject: 'body'
      })
  )

  return {
    entry: './src/app/assets/scripts/index.js',

    output: {
      filename: 'assets/js/bundle.js',
      path: isProd
        ? path.resolve(__dirname, `public/wp-content/themes/${pkg.name}`)
        : path.resolve(__dirname, 'dist'),
      publicPath: '/'
    },

    module: {
      rules: [
        {
          test: /\.pug$/,
          use: 'pug-loader'
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: 'babel-loader'
        },
        {
          test: /\.(scss|css)$/,
          use: [
            isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.styl$/,
          use: [
            isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            'stylus-loader'
          ]
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/images/[name][ext]'
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/fonts/[name][ext]'
          }
        }
      ]
    },

    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [
          'assets/**/*',
          'front/**/*'
        ]
      }),

      ...(isDev ? htmlPlugins : htmlPlugins),

      new MiniCssExtractPlugin({
        filename: 'assets/css/style.min.css'
      }),

      ...(isProd
        ? [
            new CopyWebpackPlugin({
              patterns: [
                {
                  from: 'src/public/images',
                  to: 'assets/images'
                },
                {
                  from: 'src/public/fonts',
                  to: 'assets/fonts'
                },
                {
                  from: 'src/public',
                  to: './',
                  globOptions: {
                    ignore: [
                      '**/images/**',
                      '**/fonts/**'
                    ]
                  }
                }
              ]
            })
          ]
        : [])
    ],

    devtool: isDev ? 'source-map' : false,

    devServer: {
      static: {
        directory: path.resolve(__dirname, 'dist')
      },
      port: 8080,
      hot: true,
      open: {
        target: ['/front/index.html']
      },
      watchFiles: [
        'src/**/*.pug'
      ]
    },

    resolve: {
      extensions: ['.js', '.jsx'],
      alias: {
        images: path.resolve(__dirname, 'src/public/images'),
        fonts: path.resolve(__dirname, 'src/public/fonts')
      }
    },

    optimization: {
      minimize: isProd,
      minimizer: [
        new TerserPlugin(),
        new CssMinimizerPlugin()
      ]
    }
  }
}
