// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import userRoutes from './routes/user.routes';
import sequelize from './config/db.config';
import { healthCheck } from './healthCheck';
import { handleStripeWebhook } from './controllers/stripe.controller';
import { sendDiscordWebhook } from './config/utils/discordWebhook';

const app = express();

// Middleware
const corsOptions = {
  origin: [
    'https://landing.busybody.io',
    'https://signup.busybody.io',
    'https://busybody-21510f.webflow.io'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(helmet());

// IMPORTANT: Use express.raw() BEFORE express.json() for Stripe webhooks
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.get('/api/health', healthCheck);
app.post('/api/stripe/webhook', handleStripeWebhook);
app.post('/mailchimp', express.json(), async (req, res) => {
  try {
    const { email, name, checkoutLink, discountCode } = req.body;
    console.log("Data received for Mailchimp:", { email, name, checkoutLink, discountCode });
    
    if (!email || !name || !checkoutLink) {
      return res.status(400).json({ message: 'Missing required data' });
    }
    
    // In a production environment, you would add the actual Mailchimp API integration
    // For now we're just logging the data and returning success
    await sendDiscordWebhook(`Mailchimp notification for ${email}: Abandoned checkout with link ${checkoutLink}`);
    
    return res.status(200).json({ 
      message: "OK",
      success: true 
    });
  } catch (error: any) {
    console.error('Error with Mailchimp proxy:', error);
    await sendDiscordWebhook(`Error with mailchimp proxy: ${error.message}`);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Database Connection
sequelize.sync()
  .then(() => {
    console.log('Database connected.');
  })
  .catch(async (err) => {
    console.error('Unable to connect to the database:', err);
    await sendDiscordWebhook(`Database connection error: ${err.message}`);
  });

export default app;