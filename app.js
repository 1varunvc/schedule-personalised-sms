/* As we are using the serverless function (./netlify/functions/sendSMS.js,) this file app.js is essentially not required.
However, to test sendSMS.js directly from the terminal locally, use the command node app.js.

For testing, you can also use:
netlify dev (in one terminal)
curl -X GET http://localhost:8888/.netlify/functions/sendSMS -H "Content-Type: application/json" (in another terminal.)

Modify the port 8888 if your netlify dev server uses a different one.
*/

require('dotenv').config();
const messages = require('./messages');
const logger = require('./logger');

// The main function to run the script
(async () => {
    const randomIndex = Math.floor(Math.random() * messages.length);
    const messageToSend = messages[randomIndex];

    logger.info('SMS scheduler started.');
    logger.info(`Sending message at the index: ${randomIndex}`);
    logger.info(`Sending message: "${messageToSend}" to PHONE_NUMBER_1.`);

    fetch("https://sms-scheduler-01.netlify.app/.netlify/functions/sendSMS", {
        method: "GET"
        // headers: {"Content-Type": "application/json"},
        // body: JSON.stringify({phoneNumber: process.env.PHONE_NUMBER_1, message: messageToSend})
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                logger.info("Message sent successfully.");
            } else {
                logger.info("Unable to send the scheduled message after retries.");
            }
        })
        .catch(error => {
            logger.error("Request failed: " + error);
        });
})();
