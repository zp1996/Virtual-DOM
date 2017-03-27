module.exports = {
    entry: `${__dirname}/lib/index.js`,
    output: {
        filename: 'vdom.js',
        path: `${__dirname}/build`
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: [ 'babel-loader' ]
        }]
    }
};
