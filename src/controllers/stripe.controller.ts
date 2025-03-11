// src/controllers/stripe.controller.ts
import { Request, Response, RequestHandler } from 'express';
import Stripe from 'stripe';
import stripe from '../config/stripe.config';
import User from '../models/user.model';
import { sendDiscordWebhook } from '../config/utils/discordWebhook';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const handleStripeWebhook: RequestHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    await sendDiscordWebhook(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      try {
        // Extract user ID from metadata
        const userId = session.metadata?.userId;
        const userEmail = session.metadata?.userEmail;
        const tempUserId = session.metadata?.tempUserId;

        if (!userId && !userEmail && !tempUserId) {
          console.error('No user identifier found in Stripe metadata.');
          await sendDiscordWebhook('No user identifier found in Stripe metadata.');
          break;
        }

        // Find user
        let user;
        if (userId) {
          user = await User.findByPk(parseInt(userId));
        } else if (tempUserId) {
          user = await User.findOne({ where: { tempUserId } });
        } else if (userEmail) {
          user = await User.findOne({ where: { email: userEmail } });
        }

        if (!user) {
          console.error('Webhook: User not found for ID:', userId || tempUserId || userEmail);
          await sendDiscordWebhook(`Webhook: User not found for identifier: ${userId || tempUserId || userEmail}`);
          break;
        }

        // Update user record (set paid = true and update status)
        await user.update({ paid: true, status: 'paymentCompleted' });
        console.log('User updated');
        await sendDiscordWebhook(`User ${userEmail}, User ID: ${userId}, payment successful!`);

        // --- Make API Call to Bubble ---
        const userData = user.toJSON() as any;
        
        // Parse JSON fields before sending
        if (userData.obstacle) userData.obstacle = JSON.parse(userData.obstacle);
        if (userData.fitnessFocus) userData.fitnessFocus = JSON.parse(userData.fitnessFocus);
        if (userData.exerciseType) userData.exerciseType = JSON.parse(userData.exerciseType);
        if (userData.dietaryPreference) userData.dietaryPreference = JSON.parse(userData.dietaryPreference);

        // Convert to preferred units for Bubble API
        if (userData.weightUnit === 'lbs') {
          if (userData.currentWeightLbs) userData.currentWeight = userData.currentWeightLbs;
          if (userData.goalWeightLbs) userData.goalWeight = userData.goalWeightLbs;
          if (userData.desiredWeightLossLbs) userData.desiredWeightLoss = userData.desiredWeightLossLbs;
          if (userData.weightToLoseLbs) userData.weightToLose = userData.weightToLoseLbs;
        }
        
        if (userData.heightUnit === 'ft' && userData.heightFeet) {
          userData.height = userData.heightFeet;
        }

        try {
          await axios.post('https://busybody-v1.bubbleapps.io/version-test/api/1.1/wf/wf-onboarding', userData, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          console.log('Successfully sent data to Bubble');
          await sendDiscordWebhook(`Successfully sent data to Bubble for user: ${userEmail}`);
        } catch (bubbleError: any) {
          console.error(
            'Error sending data to Bubble:',
            bubbleError.response ? bubbleError.response.data : bubbleError.message
          );
          await sendDiscordWebhook(`Error on bubble API call: ${bubbleError.message}`);
        }
      } catch (error: any) {
        console.error('Error updating user after payment:', error);
        await sendDiscordWebhook(`Error updating user after payment: ${error.message}`);
      }
      break;
    }

    default:
      await sendDiscordWebhook(`Unhandled event type ${event.type}`);
      console.log(`Unhandled event type ${event.type}`);
  }

  // Acknowledge receipt of the event
  return res.json({ received: true });
};