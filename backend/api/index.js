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
		const hint = bootError.code === 'SQLITE_NATIVE_BINDING_MISSING'
			? 'SQLite native bindings are missing in the serverless bundle. Ensure sqlite3/sqlcipher binaries are included.'
			: undefined;

		return res.status(500).json({
			message: 'Backend failed to initialize',
			code: 'BOOTSTRAP_FAILED',
			detail: process.env.NODE_ENV !== 'production' ? bootError.message : undefined,
			hint
		});
	}

	return app(req, res);
};
