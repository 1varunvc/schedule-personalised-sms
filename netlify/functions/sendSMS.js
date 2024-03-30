const logger = require('../../logger.js')
const messages = require('../../messages');

function maskPhoneNumber(phoneNumber) {
    // Check if the phoneNumber is valid
    if (!phoneNumber || phoneNumber.length < 4) {
        return phoneNumber; // Return the original string if it's too short to mask
    }

    // Extract the last 4 digits
    const lastFourDigits = phoneNumber.slice(-4);

    // Create the masked part by repeating 'X' for the rest of the length
    const maskedSection = 'X'.repeat(phoneNumber.length - 4);

    // Combine the masked part with the last 4 digits
    return maskedSection + lastFourDigits;
}

exports.handler = async (event) => {
    const twilio = require('twilio');
    const validator = require('validator');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const randomIndex = Math.floor(Math.random() * messages.length);
    const messageToSend = messages[randomIndex];
    const phoneNumber = process.env.PHONE_NUMBER_2;
    const maskedPhoneNumber = maskPhoneNumber(phoneNumber);

    // The following is commented out as we are no longer using the body of a request to assign the phoneNumber and the message.
    // // Extract phoneNumber and message from event body
    // const {phoneNumber, message} = JSON.parse(event.body);

    logger.info('SMS scheduler started.');

    // Validate phone number
    if (!validator.isMobilePhone(phoneNumber, 'any', {strictMode: false})) {
        logger.error(`Invalid phone number: ${maskedPhoneNumber}`);
        return {statusCode: 400, body: JSON.stringify({success: false, message: "Invalid phone number."})};
    }

    // Send SMS with retry logic
    const sendSMS = async (phoneNumber, message, attempt = 0) => {
        const maxAttempts = 3;
        const retryDelay = 5000;

        try {
            logger.info(`Sending message at the index: ${randomIndex}`);
            logger.info(`Sending message: "${message}" to ${maskedPhoneNumber}.`);

            const response = await client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phoneNumber
            });
            logger.info(`SMS sent successfully to ${maskedPhoneNumber}: ${response.sid}`);
            return {statusCode: 200, body: JSON.stringify({success: true, message: "SMS sent successfully."})};
        } catch (error) {
            logger.info(`Attempt ${attempt + 1}: Failed to send SMS to ${maskedPhoneNumber}: ${error.message}`);

            if (error.response) {
                logger.error(`SMS send error: Server responded with status ${error.response.status}`);
                logger.error(`Full error: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                logger.error('SMS send error: No response received for the request.');
            }

            if (attempt < maxAttempts - 1) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return sendSMS(phoneNumber, message, attempt + 1);
            } else {
                logger.error(`Failed to send SMS after ${maxAttempts} attempts.`);
                return {
                    statusCode: 500,
                    body: JSON.stringify({success: false, message: "Failed to send SMS after retries."})
                };
            }
        }
    };

    // Execute sendSMS function
    return sendSMS(phoneNumber, messageToSend);
};
