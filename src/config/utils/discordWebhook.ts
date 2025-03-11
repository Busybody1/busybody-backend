import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const sendDiscordWebhook = async (message: string) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('Discord webhook URL not configured.');
    return;
  }

  try {
    await axios.post(webhookUrl, { content: message });
  } catch (error) {
    console.error('Error sending Discord webhook:', error);
  }
};
