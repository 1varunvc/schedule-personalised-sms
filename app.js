require('dotenv').config();
const cron = require('node-cron');
const winston = require('winston');
require('winston-daily-rotate-file');
const validator = require('validator');
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const messages = require('./messages');

// Setup Winston for secure logging
const logger = winston.createLogger({
    transports: [new winston.transports.DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d'
    }), new winston.transports.Console({
        format: winston.format.simple(),
    })],
    format: winston.format.combine(winston.format.timestamp(), winston.format.printf(info => `${info.timestamp} - ${info.message}`)),
    exceptionHandlers: [new winston.transports.File({filename: 'logs/exceptions.log'})],
    rejectionHandlers: [new winston.transports.File({filename: 'logs/rejections.log'})]
});

// Securely log messages without sensitive data
function logMessage(message) {
    logger.info(message);
}

// Function to validate phone numbers
function isValidPhoneNumber(phoneNumber) {
    return validator.isMobilePhone(phoneNumber, 'any', {strictMode: false});
}

// Utility function for delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Enhanced sendSMS function with retry mechanism
async function sendSMS(phoneNumber, message, attempt = 0) {
    const maxAttempts = 3; // Max retry attempts
    const retryDelay = 5000; // Delay between retries in milliseconds

    try {
        const response = await client.messages.create({
            body: message, from: process.env.TWILIO_PHONE_NUMBER, to: phoneNumber
        });
        logMessage(`SMS sent successfully to ${phoneNumber}: ${response.sid}`);
        return true; // Indicate success
    } catch (error) {
        // Log the attempt and error message
        logMessage(`Attempt ${attempt + 1}: Failed to send SMS to ${phoneNumber}: ${error.message}`);

        // Check for specific error conditions and log details
        if (error.response) {
            logMessage(`SMS send error: Server responded with status ${error.response.status}`);
            logMessage(`Full error: ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            logMessage('SMS send error: No response received for the request.');
        }

        // Retry logic
        if (attempt < maxAttempts - 1) {
            await delay(retryDelay); // Wait before retrying
            return sendSMS(phoneNumber, message, attempt + 1); // Recursive retry
        } else {
            logMessage(`Failed to send SMS after ${maxAttempts} attempts.`);
            return false; // Indicate failure after max attempts
        }
    }
}

// Function to simulate a random delay
function randomDelay(minSeconds, maxSeconds) {
    return Math.floor(Math.random() * (maxSeconds - minSeconds + 1) + minSeconds);
}

// Schedule the task to run every day at 7:03 AM
cron.schedule('7 7 * * *', async () => {
    const delaySeconds = randomDelay(0, 180);
    const randomIndex = Math.floor(Math.random() * messages.length);
    const messageToSend = messages[randomIndex];

    logMessage(`Sending message at the index: ${randomIndex}`);

    setTimeout(async () => {
        logMessage(`Sending message: "${messageToSend}" to ${process.env.PHONE_NUMBER_1}`);
        const success = await sendSMS(process.env.PHONE_NUMBER_1, messageToSend);
        if (success) {
            logMessage(`Message sent successfully.`);
        } else {
            logMessage(`Unable to send the scheduled message after retries.`);
        }
    }, 0); // Convert seconds to milliseconds for setTimeout
}, {
    scheduled: true, timezone: "Asia/Kolkata"
});

logMessage('SMS scheduler with approximate time started.');
