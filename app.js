require('dotenv').config();
const cron = require('node-cron');
const axios = require('axios');
const winston = require('winston');
require('winston-daily-rotate-file');
const validator = require('validator');
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Setup Winston for secure logging
const logger = winston.createLogger({
    transports: [
        new winston.transports.DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        }),
        new winston.transports.Console({
            format: winston.format.simple(),
        })
    ],
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => `${info.timestamp} - ${info.message}`)
    ),
    exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log' })
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: 'logs/rejections.log' })
    ]
});

// Securely log messages without sensitive data
function logMessage(message) {
    logger.info(message);
}

// Function to validate phone numbers
function isValidPhoneNumber(phoneNumber) {
    return validator.isMobilePhone(phoneNumber, 'any', { strictMode: false });
}

// Improved function to send an SMS with input validation and enhanced error handling
async function sendSMS(phoneNumber, message) {
    if (!isValidPhoneNumber(phoneNumber)) {
        logMessage(`Invalid phone number: ${phoneNumber}`);
        return;
    }

    try {
        const response = await client.messages
            .create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phoneNumber
            })
        logMessage(`SMS sent successfully to ${phoneNumber}: ${response.sid}`);
    } catch (error) {
        if (error.response) {
            logMessage(`SMS send error: Server responded with status ${error.response.status}`);
            logMessage(`Full error: ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            logMessage('SMS send error: No response received for the request.');
        } else {
            logMessage(`SMS send error: ${error.message}`);
        }
    }
}

// Function to simulate a random delay
function randomDelay(minSeconds, maxSeconds) {
    return Math.floor(Math.random() * (maxSeconds - minSeconds + 1) + minSeconds);
}

// // Schedule the task to run every day at 7:00 AM
// cron.schedule('0 7 * * *', () => {
//     // Calculate a random delay between 0 and 180 seconds (3 minutes)
//     const delaySeconds = randomDelay(0, 180);
//
//     setTimeout(() => {
//         logMessage('Starting to send scheduled SMS messages after a delay...');
//         sendSMS(process.env.PHONE_NUMBER_1, 'Good morning! Your first message.');
//         // sendSMS(process.env.PHONE_NUMBER_2, 'Good morning! Your second message.');
//     }, delaySeconds * 1000); // Convert seconds to milliseconds for setTimeout
// }, {
//     scheduled: true,
//     timezone: "Your/Timezone"
// });

sendSMS(process.env.PHONE_NUMBER_1, 'Good morning! Your first message.');

logMessage('SMS scheduler with approximate time started.');
