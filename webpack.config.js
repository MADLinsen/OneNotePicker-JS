const webpack = require('webpack');
const path = require('path');

// variables
const IS_PROD_MIN = process.env.NODE_ENV === "minify";
const IS_PROD = process.env.NODE_ENV === "production" || IS_PROD_MIN;

const IS_ANALYZE = process.env.NODE_ENV === "analyze";
const OUT_DIR = path.join(__dirname, './dist');

// plugins
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackMerge = require('webpack-merge');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

let cssFileName = IS_PROD_MIN ? "[name].css" : "[name].min.css";

const extractSass = new ExtractTextPlugin({
	filename: cssFileName,
	allChunks: true
});

const base = {
	entry: {
		sample: './sampleApp/sample.tsx',
		onenotepicker: './src/oneNotePicker.tsx'
	},
	output: {
		path: OUT_DIR,
		publicPath: '/dist/',
		filename: '[name].js',
		library: ['OneNotePicker']
	},
	target: 'web',
	resolve: {
		extensions: ['.js', '.ts', '.tsx'],
	},
	devtool: 'cheap-module-eval-source-map',
	module: {
		loaders: [
			// .ts, .tsx
			{
				test: /\.tsx?$/,
				use: IS_PROD ? 'awesome-typescript-loader' : ['react-hot-loader', 'awesome-typescript-loader']
			},
			{
				test: /\.css/,
				use: extractSass.extract({
					use: [
						{
							loader: `css-loader?importLoaders=1&minimize=${IS_PROD_MIN}!postcss-loader`
						}
					],
					fallback: 'style-loader'
				})
			},
			{
				test: /\.sass$/,
				use: extractSass.extract({
					use: [
						{
							loader: `css-loader?importLoaders=1&minimize=${IS_PROD_MIN}!postcss-loader`
						},
						{
							loader: 'sass-loader',
							options: {
								outputStyle: 'expanded',
								indentedSyntax: true,
								includePaths: [path.join(__dirname, 'node-modules')]
							}
						}
					],
					fallback: 'style-loader'
				})
			},
			{
				test: /\.scss$/,
				use: extractSass.extract({
					use: [
						{
							loader: `css-loader?importLoaders=1&minimize=${IS_PROD_MIN}!postcss-loader`
						},
						{
							loader: 'sass-loader',
							options: {
								outputStyle: 'expanded',
								includePaths: [path.join(__dirname, 'node-modules')]
							}
						}
					],
					fallback: 'style-loader'
				})
			},
			// static assets
			{test: /\.html$/, use: 'html-loader'},
			{test: /\.png$/, use: 'url-loader?limit=10000'},
			{test: /\.jpg$/, use: 'file-loader'},
		],
	},
	plugins: [
		new webpack.ProvidePlugin({
			Promise: 'es6-promise'
		}),
		new webpack.optimize.AggressiveMergingPlugin(),
		extractSass
	],
	devServer: {
		contentBase: './sampleApp',
		hot: true,
		stats: {
			warnings: false
		},
	},
	node: {
		// workaround for webpack-dev-server issue
		// https://github.com/webpack/webpack-dev-server/issues/60#issuecomment-103411179
		fs: 'empty',
		net: 'empty'
	}
};

const prod = {
	devtool: 'source-map',
	plugins: [
		new webpack.LoaderOptionsPlugin({
			minimize: true,
			debug: false
		}),
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			}
		})
	],
	externals: {
		'react': 'React',
		'react-dom': 'ReactDOM',
	}
};

const prodMinified = {
	output: {
		filename: '[name].min.js'
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: true,
		}),
	]
};

const analyze = {
	plugins: [
		new BundleAnalyzerPlugin({
			analyzerMode: 'static'
		})
	]
};

let webpackConfiguration = base;

if (IS_PROD) {
	webpackConfiguration = WebpackMerge(webpackConfiguration, prod);
}

if (IS_PROD_MIN) {
	webpackConfiguration = WebpackMerge(webpackConfiguration, prodMinified);
}

if (IS_ANALYZE) {
	webpackConfiguration = WebpackMerge(webpackConfiguration, prod);
	webpackConfiguration = WebpackMerge(webpackConfiguration, analyze);
}

module.exports = webpackConfiguration;
