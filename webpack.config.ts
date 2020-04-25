import * as path from 'path';

module.exports = {
    entry: './examples/src/main.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [{
                    loader: 'ts-loader'
                }],
                exclude: [
                    /node_modules/
                ],
            },
            {
                test: /\.html$/i,
                loader: 'html-loader',
            }
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    mode: "development",
    watch: true
};
