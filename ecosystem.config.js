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
        },
        {
            name: 'website-tts',
            script: 'TTS_app/app.py',
            interpreter: 'TTS_app/venv/bin/python3',
            env: {
                FLASK_ENV: 'production'
            }
        }
    ]
};
