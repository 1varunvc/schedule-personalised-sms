# Scheduled Personalised SMS

This application schedules personalized SMS'. Leveraging Twilio for SMS services and Netlify Functions for a serverless architecture, it's designed to send, say, daily morning reminders or notifications!

## Features

- **Serverless Architecture**: Utilizes Netlify Functions for a scalable and maintenance-free backend.
- **Flexible Scheduling**: Schedule SMS messages to be sent at specific times.
- **Twilio Integration**: Leverages Twilio's robust API for reliable SMS delivery.
- **Secure Configuration**: Employs environment variables to securely store sensitive information.

## Prerequisites

- [Twilio](https://www.twilio.com/) account: Required for SMS service integration. Twilio also provides initial credits for new accounts, facilitating a smooth start.
- [Git](https://git-scm.com/): Essential for version control and source code management.
- [Node.js](https://nodejs.org/en/): Necessary for executing the project in a local development environment.
- [Netlify](https://www.netlify.com/): For hosting and managing serverless functions.
- [EasyCron](https://www.easycron.com/) Account: Offers a generous free tier for scheduling tasks, making it a cost-effective solution for automating your SMS dispatch.

## Setup Instructions

### 1: Twilio Account Setup
Create and set up your Twilio account to manage SMS services. This involves verifying two phone numbers: one for local testing and the other for production use. For a detailed guide, see '[Getting Twilio Credentials](https://github.com/1varunvc/sms-scheduler-01/tree/main?tab=readme-ov-file#getting-twilio-credentials)' below.

### 2. Clone the Repository

```bash
git clone https://github.com/1varunvc/schedule-personalised-sms.git
cd schedule-personalised-sms
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Configure your environment variables by duplicating `.env.example` and `netlify.toml.example` files to `.env` and `netlify.toml`, respectively. Populate these files with your specific configurations, including Twilio account details and the phone numbers for testing and production.

#### A. Environment Variables File

Copy the `.env.example` file to a new file named `.env` and fill in the details:

```bash
cp .env.example .env
```

Edit `.env` with your Twilio account details and phone numbers:

- `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number
- `PHONE_NUMBER_1`: The recipient's phone number (For testing locally.)
- `PHONE_NUMBER_2`: Another recipient's phone number (For production.)
- `SMS_API_ENDPOINT`: The URL endpoint for sending SMS messages through Twilio's API (`https://api.twilio.com/2010-04-01/Accounts/TWILIO_ACCOUNT_SID/Messages.json`)
- `ENVIRONMENT`: LOCAL (Do not change.)

#### B. Netlify Configuration File

Copy the `netlify.toml.example` file to a new file named `netlify.toml` and adjust the configuration according to your project's needs:

```bash
cp netlify.toml.example netlify.toml
```

### Note on Environment Variables:

When deploying to Netlify, remember to set sensitive environment variables (like `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, etc.) directly in the Netlify UI under Site Settings > Build & Deploy > Environment, to keep them secure.

### 5: Messages Configuration (Important)
**Create** a new `messages.js` file in the root directory and populate it with your personalized message. The application is designed to randomly select messages from this file.

Exemplary `messages.js` file:
```bash
module.exports = [
   "Test Message 00",
   "Test Message 01",
   "Test Message 02"
]
```

### 6: Adjust for Local Development and Production
In `netlify/functions/sendSMS.js`, change `const phoneNumber = process.env.PHONE_NUMBER_2;` to `const phoneNumber = process.env.PHONE_NUMBER_1`; for local testing, and back to `process.env.PHONE_NUMBER_2` for production. 

### 7. Local Development

Modify `netlify/functions/sendSMS.js` to use `PHONE_NUMBER_1` for local development testing. Switch to `PHONE_NUMBER_2` when configuring for production.


To test the function locally, you can use the Netlify CLI:

#### A. Install the Netlify CLI

Open your terminal and run the following command to install the Netlify CLI globally on your system:

```bash
npm install netlify-cli -g
```

This command installs the Netlify CLI globally, allowing you to access it from any directory in your terminal.

#### B. Authenticate with Netlify

After installing the CLI, you need to authenticate your Netlify account. Run the following command:

```bash
netlify login
```

This command will open a browser window asking you to log in to Netlify and authorize the Netlify CLI. Follow the prompts to authenticate. Once authenticated, you can close the browser window.

#### C. Initialize Your Site

Navigate to your project's directory in the terminal. If you're deploying a site for the first time, you can link your project to Netlify using:

```bash
netlify init
```

This command will guide you through setting up a new site on Netlify if your project isn't already linked or it will help you link to an existing site. You'll have options to set up continuous deployment from a git provider.

#### D. Run the script locally
```bash
netlify dev
```

#### E. Make a triggering API call
In another terminal, run:

```bash
curl -X GET http://localhost:8888/.netlify/functions/sendSMS -H "Content-Type: application/json"
```

Replace `8888` with the actual port number the site is running on.

### 8: Deploy to Netlify
Before deploying, ensure that all local modifications have been committed and pushed to your GitHub repository. Then, through Netlify's dashboard, initiate a new site deployment by connecting your GitHub repository and configuring the build settings and environment variables as detailed above.

For a detailed guide, see '[Setting Up and Deploying to Netlify](https://github.com/1varunvc/sms-scheduler-01/tree/main?tab=readme-ov-file#setting-up-and-deploying-to-netlify)' below.

### 9: Schedule the Function
Utilize EasyCron to automate the execution of your Netlify function, adhering to your desired scheduling. Configure the cron job to target your function's Netlify endpoint URL, ensuring reliable, timed SMS dispatch.

For a detailed guide, see '[Setting Up EasyCron](https://github.com/1varunvc/sms-scheduler-01/tree/main?tab=readme-ov-file#setting-up-easycron)' below.

## Getting Twilio Credentials

To use Twilio for sending SMS messages, you'll need to obtain your Account SID and Auth Token from Twilio. Follow these steps:

1. **Sign Up/Login to Twilio**: If you haven't already, sign up for a free Twilio account at [Twilio's website](https://www.twilio.com/). If you already have an account, just log in.

2. **Navigate to the Dashboard**: Once logged in, you'll be directed to the Twilio Console Dashboard. Here, you can find your Account SID and Auth Token.

3. **Find Your Account SID and Auth Token**:
    - Your **Account SID** is visible right on the dashboard, labeled as **ACCOUNT SID**.
    - Your **Auth Token** can be found next to the Account SID. Click on `Show` to reveal the Auth Token.

4. **Secure Your Credentials**: Copy these values into your `.env` file for local development. Never commit your `.env` file or directly include your SID/Token in your public code.

## Setting Up and Deploying to Netlify

To deploy your application on Netlify with continuous deployment:

### Connecting Your Repository

1. **Create a Netlify Account**: If you haven't already, sign up at [Netlify](https://www.netlify.com/).

2. **New Site from Git**: On your Netlify dashboard, click the **New site from Git** button.

3. **Connect to Git Provider**: Choose your Git provider (GitHub, GitLab, Bitbucket) and authenticate if required.

4. **Pick Your Repository**: Select your repository that contains your project.

5. **Configure Build Settings**: Input the build command and publish directory for your project if applicable. For serverless functions, specify the functions directory.

    - **Build Command**: (Leave blank if you're only deploying functions)
    - **Publish Directory**: `.` (Indicates there's no specific directory for static content.)
    - **Functions Directory**: Specify if you have serverless functions, e.g., `netlify/functions`

6. **Set Environment Variables**: Under **Advanced build settings**, add environment variables such as `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and any others required by your application.

7. **Deploy Site**: Click **Deploy site**. Netlify will begin the deployment process.

### Domain Configuration

After deployment, Netlify assigns a default subdomain for your site, which you can change in your site settings.

## Setting Up EasyCron

To schedule your serverless function to run at specific times:

1. **Sign Up for EasyCron**: Go to [EasyCron](https://www.easycron.com/) and create an account.

2. **Create a New Cron Job**: Once logged in, click on **Create New Cron Job**.

3. **Configure Your Cron Job**:
    - In the **URL to call** field, enter the Netlify function endpoint URL. It will look something like `https://your-netlify-site-name.netlify.app/.netlify/functions/your-function-name`.
    - Set the schedule according to your preference, using the cron expression format.

4. **Start Cron Job**: Save your cron job. EasyCron will now trigger your Netlify function according to the schedule you set.

Remember to replace placeholders like `your-netlify-site-name`, `your-function-name`, etc., with the actual values corresponding to your Netlify site and function name.

---

## Usage

Once deployed, the application will automatically send SMS messages at the scheduled times. You can modify the schedule and message content by editing the serverless function and redeploying.

## Contributing

Contributions to the application are welcome. Please ensure to follow the best practices for coding and documentation. Create a pull request with a clear description of your changes.
