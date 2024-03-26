const twilio = require('twilio');
const validator = require('validator');

exports.handler = async (event) => {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    // Extract phoneNumber and message from event body
    const { phoneNumber, message } = JSON.parse(event.body);

    // Function to log messages, simplified to use console.log for serverless context
    function logMessage(message) {
        console.log(message);
    }

    // Validate phone number
    if (!validator.isMobilePhone(phoneNumber, 'any', { strictMode: false })) {
        logMessage(`Invalid phone number: ${phoneNumber}`);
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid phone number." }) };
    }

    // Send SMS with retry logic
    const sendSMS = async (phoneNumber, message, attempt = 0) => {
        const maxAttempts = 3;
        const retryDelay = 5000;

        try {
            const response = await client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phoneNumber
            });
            logMessage(`SMS sent successfully to ${phoneNumber}: ${response.sid}`);
            return { statusCode: 200, body: JSON.stringify({ success: true, message: "SMS sent successfully."}) };
        } catch (error) {
            logMessage(`Attempt ${attempt + 1}: Failed to send SMS to ${phoneNumber}: ${error.message}`);

            if (error.response) {
                logMessage(`SMS send error: Server responded with status ${error.response.status}`);
                logMessage(`Full error: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                logMessage('SMS send error: No response received for the request.');
            }

            if (attempt < maxAttempts - 1) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return sendSMS(phoneNumber, message, attempt + 1);
            } else {
                logMessage(`Failed to send SMS after ${maxAttempts} attempts.`);
                return { statusCode: 500, body: JSON.stringify({ success: false, message: "Failed to send SMS after retries." }) };
            }
        }
    };

    // Execute sendSMS function
    return sendSMS(phoneNumber, message);
};
