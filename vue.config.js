const webpack = require('webpack');
const path = require('path');

const LIB_MODE = Boolean(process.env.LIB_MODE);

const LIB_MODE_CONFIG = {
	// No source map on library mode, we don't need them
	// because we're publishing the source
	productionSourceMap: false,
	css: {
		// Extract CSS to separate file for SSR
		// (in SSR mode without a separate file, an error is thrown
		// because the styles are appended to <head>)
		extract: true
	},
	configureWebpack: {
		entry: './src/index.ts',
		output: {
			libraryExport: 'default'
		},
		plugins: [
			// Do not split to chunks when building the library
			new webpack.optimize.LimitChunkCountPlugin({
				maxChunks: 1
			})
		],
		externals: [
			{
				'vue': {
					commonjs: 'vue',
					commonjs2: 'vue',
					amd: 'vue',
					root: 'Vue'
				}
			},
			/^pdfjs-dist/
		]
	},
	chainWebpack: (config) => {
		// Do not split to chunks when building the library
		config.optimization.delete('splitChunks');
		config.optimization.splitChunks(false);
	}
};

const DEV_MODE_CONFIG = {
	configureWebpack: {
		entry: './dev/main.ts'
	},
	chainWebpack: (config) => {
		// Use index.html in dev folder
		config
			.plugin('html')
			.tap(args => {
				args[0].template = './dev/public/index.html';

				return args;
			});

		config
			.plugin('copy')
			.use(require('copy-webpack-plugin'))
			.tap((args) => {
				return [
					[
						...(args[0] ? args[0] : []),
						{
							from: path.resolve('./dev/public')
						}
					]
				];
			});
	},
	transpileDependencies: [
		'pdfjs-dist'
	]
};

const currentConfig = LIB_MODE ? LIB_MODE_CONFIG : DEV_MODE_CONFIG;

module.exports = currentConfig;
