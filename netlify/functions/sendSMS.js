const logger = require('../../logger.js')
const messages = require('../../messages');

exports.handler = async (event) => {
    const twilio = require('twilio');
    const validator = require('validator');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const randomIndex = Math.floor(Math.random() * messages.length);
    const messageToSend = messages[randomIndex];
    const phoneNumber = process.env.PHONE_NUMBER_2;

    // The following is commented out as we are no longer using the body of a request to assign the phoneNumber and the message.
    // // Extract phoneNumber and message from event body
    // const {phoneNumber, message} = JSON.parse(event.body);

    logger.info('SMS scheduler started.');

    // Validate phone number
    if (!validator.isMobilePhone(phoneNumber, 'any', {strictMode: false})) {
        logger.error(`Invalid phone number: PHONE_NUMBER_2`);
        return {statusCode: 400, body: JSON.stringify({success: false, message: "Invalid phone number."})};
    }

    // Send SMS with retry logic
    const sendSMS = async (phoneNumber, message, attempt = 0) => {
        const maxAttempts = 3;
        const retryDelay = 5000;

        try {
            logger.info(`Sending message at the index: ${randomIndex}`);
            logger.info(`Sending message: "${message}" to PHONE_NUMBER_2.`);

            const response = await client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phoneNumber
            });
            logger.info(`SMS sent successfully to PHONE_NUMBER_2: ${response.sid}`);
            return {statusCode: 200, body: JSON.stringify({success: true, message: "SMS sent successfully."})};
        } catch (error) {
            logger.info(`Attempt ${attempt + 1}: Failed to send SMS to PHONE_NUMBER_2: ${error.message}`);

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
