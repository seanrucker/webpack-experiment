const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const package = require('./package.json');
const parts = require('./lib/parts');
const path = require('path');
const validate = require('webpack-validator');

const PATHS = {
    app: path.join(__dirname, 'app'),
    style: [
        path.join(__dirname, 'node_modules', 'purecss'),
        path.join(__dirname, 'app', 'main.css')
    ],
    build: path.join(__dirname, 'build')
};

const common = {
    entry: {
        app: PATHS.app,
        style: PATHS.style
    },
    output: {
        path: PATHS.build,
        filename: '[name].js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Webpack demo'
        })
    ]
};

var config;
switch (process.env.npm_lifecycle_event) {
    case 'build':
    case 'stats':
        config = merge(
            common, 
            { 
                devtool: 'source-map',
                output: {
                    path: PATHS.build,
                    filename: '[name].[chunkhash].js',
                    // This is used for require.ensure. The setup
                    // will work without but this is useful to set.
                    chunkFilename: '[chunkhash].js'
                }
            },
            parts.clean(PATHS.build),
            parts.setFreeVariable('process.env.NODE_ENV', 'production'),
            parts.extractBundle({
                name: 'vendor',
                entries: Object.keys(package.dependencies)
            }),
            parts.minify(),
            parts.extractCSS(PATHS.style),
            parts.purifyCSS([PATHS.app])
        );
        break;
    default:
        config = merge(
            common,
            { devtool: 'eval-source-map' },
            parts.setupCSS(PATHS.style),
            parts.devServer({
                // Customize host/port here if needed
                host: process.env.HOST,
                port: process.env.PORT
            })
        );
}

module.exports = validate(config);

// module.exports = {
//     entry: './src/app.js',
//     output: {
//         path: path.join(__dirname, 'dist'),
//         filename: 'bundle.js',
//         publicPath: '/assets/'
//     },
//     module: {
//         loaders: [{
//             test: /\.js$/,
//             include: path.join(__dirname, 'src'),
//             loader: 'babel-loader'
//         }]
//     },
//     resolve: {
//         extensions: ['', '.js', '.jsx']
//     },
// };