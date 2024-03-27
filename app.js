/* As we are using the serverless function (./netlify/functions/sendSMS.js,) this file app.js is essentially not required.
However, to test sendSMS.js directly from the terminal locally, use the command node app.js.

For testing, you can also use:
netlify dev (in one terminal)
curl -X POST http://localhost:8888/.netlify/functions/sendSMS -H "Content-Type: application/json" (in another terminal.)

Modify the port 8888 if your netlify dev server uses a different one.
*/

require('dotenv').config();
const messages = require('./messages');
const logger = require('./logger');

// Function to simulate a random delay
function randomDelay(minSeconds, maxSeconds) {
    return Math.floor(Math.random() * (maxSeconds - minSeconds + 1) + minSeconds);
}

// The main function to run the script
(async () => {
    const delaySeconds = randomDelay(0, 180);
    const randomIndex = Math.floor(Math.random() * messages.length);
    const messageToSend = messages[randomIndex];

    logger.info(`Sending message at the index: ${randomIndex}`);
    logger.info(`Sending message: "${messageToSend}" to ${process.env.PHONE_NUMBER_1} with a delay of ` + (delaySeconds/60).toFixed(2) + ` minutes.`);

    setTimeout(async () => {
        fetch("https://sms-scheduler-01.netlify.app/.netlify/functions/sendSMS", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({phoneNumber: process.env.PHONE_NUMBER_1, message: messageToSend})
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
    }, delaySeconds * 1000); // Convert seconds to milliseconds for setTimeout
})();


logger.info('SMS scheduler with approximate time started.');
