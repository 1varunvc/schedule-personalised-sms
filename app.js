require('dotenv').config();
const winston = require('winston');
require('winston-daily-rotate-file');
const validator = require('validator');
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const messages = require('./messages');
const runningLocally = (process.env.ENVIRONMENT == "Local")

// Configure transports based on environment
const transports = [];

if (runningLocally) {
    // Local environment: Log to files
    transports.push(new winston.transports.DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d'
    }));
} else {
    // Netlify environment: Log to console
    transports.push(new winston.transports.Console());
}

// Initialize Winston logger for secure logging and use dynamic transports
const logger = winston.createLogger({
    level: 'info', // Default logging level
    format: winston.format.combine(winston.format.timestamp(), winston.format.printf(info => `${info.timestamp} - ${info.level}: ${info.message}`)),
    transports: transports,
    exceptionHandlers: runningLocally ? [new winston.transports.File({filename: 'logs/exceptions.log'})] : [new winston.transports.Console()],
    rejectionHandlers: runningLocally ? [new winston.transports.File({filename: 'logs/rejections.log'})] : [new winston.transports.Console()]
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

    if (!isValidPhoneNumber(phoneNumber)) {
        logMessage(`Invalid phone number: ${phoneNumber}`);
        return false;
    }

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

// The main function to run the script
(async () => {
    const delaySeconds = randomDelay(0, 180);
    const randomIndex = Math.floor(Math.random() * messages.length);
    const messageToSend = messages[randomIndex];

    logMessage(`Sending message at the index: ${randomIndex}`);
    logMessage(`Sending message: "${messageToSend}" to ${process.env.PHONE_NUMBER_2}`);

    if (runningLocally) {
        const success = await sendSMS(process.env.PHONE_NUMBER_2, messageToSend);
        if (success) {
            logMessage(`Message sent successfully.`);
        } else {
            logMessage(`Unable to send the scheduled message after retries.`);
        }
    } else {
        setTimeout(async () => {
            fetch("https://your-netlify-app/.netlify/functions/sendSMS", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({phoneNumber: process.env.PHONE_NUMBER_2, message: messageToSend})
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        logMessage("Message sent successfully.");
                    } else {
                        logMessage("Unable to send the scheduled message after retries.");
                    }
                })
                .catch(error => {
                    logMessage("Request failed: " + error);
                });
        }, delaySeconds * 1000); // Convert seconds to milliseconds for setTimeout
    }
})();


logMessage('SMS scheduler with approximate time started.');
