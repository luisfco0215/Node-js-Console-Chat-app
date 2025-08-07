const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'chat.log');

function appendToLogFile(content) {
    const timestamp = new Date().toISOString();
    fs.appendFile(logFilePath, `[${timestamp}] ${content}\n`, (err) => {
        if (err) console.error('Error writing to log file:', err);
    });
}
