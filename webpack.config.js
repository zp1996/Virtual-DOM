const HtmlWebpackPlugin = require('html-webpack-plugin'),
    buildPath = `${__dirname}/build`;

module.exports = {
    entry: `${__dirname}/lib/index.js`,
    output: {
        filename: 'vdom.js',
        path: buildPath
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: [ 'babel-loader' ]
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: `${__dirname}/templates/demo.html`,
            filename: `${buildPath}/demo.html`
        })
    ]
};
