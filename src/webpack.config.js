const path = require('path');

module.exports = {
    mode: 'development', // or 'production'
    entry: './src/index.js', // Adjust to your entry point
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        fallback: {
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
        },
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader', // Adjust if you're using a different loader
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'], // Add necessary presets
                    },
                },
            },
            // ... other loaders if necessary ...
        ],
    },
    // ... additional configurations if needed ...
};
