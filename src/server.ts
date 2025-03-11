import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { sendDiscordWebhook } from './config/utils/discordWebhook';

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await sendDiscordWebhook('Shutting down server...');
  server.close(() => {
    console.log('Server shut down.');
    process.exit(0);
  });
});
