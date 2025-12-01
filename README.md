# Telegram Bot Dashboard

A full-featured Telegram bot with auto-reply functionality and an admin dashboard built with Next.js, MongoDB, and Telegraf.

## Features

- Auto-reply to user messages based on keywords
- Admin dashboard for managing bot responses
- User authentication system
- MongoDB integration for storing templates and users
- Responsive UI with Tailwind CSS

## Prerequisites

- Node.js 18 or higher
- MongoDB cluster (MongoDB Atlas recommended)
- Telegram account

## Getting Started

1. Clone the repository:
   ```
   git clone <repository-url>
   cd telegram-bot-dashboard
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Update the values with your own:
     - `MONGODB_URI`: Your MongoDB connection string
     - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token (see below for how to get one)
     - `JWT_SECRET`: A secret key for JWT tokens
     - `ADMIN_USERNAME`: Admin username for the dashboard
     - `ADMIN_PASSWORD`: Admin password for the dashboard

4. Initialize the database:
   ```
   npm run init-db
   ```

5. Run the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to access the admin dashboard.

## Setting Up Your Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Start a chat with BotFather and send `/newbot`
3. Follow the instructions to create a new bot
4. Copy the bot token provided by BotFather
5. Add the token to your `.env.local` file as `TELEGRAM_BOT_TOKEN`
6. Restart your development server

## Setting the Webhook

To receive messages from Telegram, you need to set up a webhook:

1. Deploy your application to a public URL (Vercel, Netlify, etc.)
2. Visit `https://your-domain.com/api/telegram` in your browser
3. You should see a message confirming that the webhook was set

## Usage

1. Log in to the admin dashboard using the credentials in your `.env.local` file
2. Navigate to the "Templates" section
3. Create auto-reply templates by specifying keywords and responses
4. Test your bot by sending messages to it on Telegram

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!