const { exec } = require('child_process');
const path = require('path');

console.log('Running backend smoke test...');

const serverPath = path.join(__dirname, 'server.js');
const serverProcess = exec(`node ${serverPath}`, {
    env: { ...process.env, NODE_ENV: 'test', PORT: 5099 }
});

let output = '';
serverProcess.stdout.on('data', (data) => {
    output += data;
    if (output.includes('Server running') || output.includes('connected successfully')) {
        console.log('✅ Backend started successfully!');
        serverProcess.kill();
        process.exit(0);
    }
});

serverProcess.stderr.on('data', (data) => {
    console.error('stderr:', data);
});

setTimeout(() => {
    console.error('❌ Smoke test timed out');
    serverProcess.kill();
    process.exit(1);
}, 10000);
