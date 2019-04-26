module.exports = {
	devServer: {
		proxy: {
			// Redirect api requests in development mode
			'^/api': {
				target: 'http://localhost:5000/',
				changeOrigin: true
			}
		}
	}
};
