require('dotenv').config();
const messages = require('messages');
const logger = require('logger');

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
    logger.info(`Sending message: "${messageToSend}" to ${process.env.PHONE_NUMBER_2}`);

    setTimeout(async () => {
        fetch("https://your-netlify-app/.netlify/functions/sendSMS", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({phoneNumber: process.env.PHONE_NUMBER_2, message: messageToSend})
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
