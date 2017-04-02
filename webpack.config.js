const CleanWebpackPlugin = require('clean-webpack-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    buildPath = `${__dirname}/build`,
    demos = ['demo'],
    lib = 'vdom';

const HtmlWebpackPlugins = demos.map(
    demo => new HtmlWebpackPlugin({
        template: `${__dirname}/examples/${demo}/${demo}.html`,
        filename: `${buildPath}/${demo}.html`,
        chunks: [ demo, lib ]
    })
);

const entry = demos.reduce((obj, name) => {
    return Object.assign({
        [name]: `${__dirname}/examples/${name}/${name}.js`
    }, obj);
}, {
    [lib]: `${__dirname}/lib/index.js`
});

module.exports = {
    entry,
    output: {
        filename: `[name].[chunkhash:8].js`,
        path: buildPath
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: [ 'babel-loader' ]
        }]
    },
    plugins: [
        new CleanWebpackPlugin([ buildPath ], {
                root: __dirname,
                verbose: true,
                dry: false
            }
        ),
        ...HtmlWebpackPlugins
    ]
};
