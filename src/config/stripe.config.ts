import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY is not set in your environment variables.');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
});

export default stripe;
