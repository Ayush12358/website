module.exports = {
    apps: [
        {
            name: 'website-backend',
            script: 'backend/server.js',
            env: {
                NODE_ENV: 'production',
                PORT: 5001
            }
        },
        {
            name: 'website-frontend',
            script: 'node_modules/.bin/serve',
            args: '-s frontend/build -l 8000',
            env: {
                NODE_ENV: 'production'
            }
        }
    ]
};
