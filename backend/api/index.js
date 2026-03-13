let app;
let bootError;

try {
	app = require('../server');
} catch (error) {
	bootError = error;
	console.error('Server bootstrap failed:', error);
}

module.exports = (req, res) => {
	if (bootError) {
		return res.status(500).json({
			message: 'Backend failed to initialize',
			code: 'BOOTSTRAP_FAILED',
			detail: process.env.NODE_ENV !== 'production' ? bootError.message : undefined
		});
	}

	return app(req, res);
};
