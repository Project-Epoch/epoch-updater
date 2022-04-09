module.exports = [
  // Add support for native node modules
  {
    // We're specifying native_modules in the test because the asset relocator loader generates a
    // "fake" .node file which is really a cjs file.
    test: /native_modules\/.+\.node$/,
    use: 'node-loader',
  },
  {
    test: /\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
      },
    },
  },
  {
    test: /\.(scss)$/, // all scss files will be handled
    // Use loaders in that specific reverse order
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
      },
      {
        loader: 'sass-loader'
      },
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            plugins: function () {
              return [
                require('autoprefixer')
              ];
            }
          }
        }
      },
    ]
  },
  {
    test: /\.(png|jpeg|jpg|gif|ico|svg)$/, // We will handle of these file extensions
    use: [
      {
        loader: "file-loader",
      }
    ]
  },
];
