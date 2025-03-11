"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = void 0;
const stripe_config_1 = __importDefault(require("../config/stripe.config"));
const user_model_1 = __importDefault(require("../models/user.model"));
const discordWebhook_1 = require("../config/utils/discordWebhook");
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const handleStripeWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe_config_1.default.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
    }
    catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        yield (0, discordWebhook_1.sendDiscordWebhook)(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            try {
                // Extract user ID from metadata
                const userId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.userId;
                const userEmail = (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.userEmail;
                const tempUserId = (_c = session.metadata) === null || _c === void 0 ? void 0 : _c.tempUserId;
                if (!userId && !userEmail && !tempUserId) {
                    console.error('No user identifier found in Stripe metadata.');
                    yield (0, discordWebhook_1.sendDiscordWebhook)('No user identifier found in Stripe metadata.');
                    break;
                }
                // Find user
                let user;
                if (userId) {
                    user = yield user_model_1.default.findByPk(parseInt(userId));
                }
                else if (tempUserId) {
                    user = yield user_model_1.default.findOne({ where: { tempUserId } });
                }
                else if (userEmail) {
                    user = yield user_model_1.default.findOne({ where: { email: userEmail } });
                }
                if (!user) {
                    console.error('Webhook: User not found for ID:', userId || tempUserId || userEmail);
                    yield (0, discordWebhook_1.sendDiscordWebhook)(`Webhook: User not found for identifier: ${userId || tempUserId || userEmail}`);
                    break;
                }
                // Update user record (set paid = true and update status)
                yield user.update({ paid: true, status: 'paymentCompleted' });
                console.log('User updated');
                yield (0, discordWebhook_1.sendDiscordWebhook)(`User ${userEmail}, User ID: ${userId}, payment successful!`);
                // --- Make API Call to Bubble ---
                const userData = user.toJSON();
                // Parse JSON fields before sending
                if (userData.obstacle)
                    userData.obstacle = JSON.parse(userData.obstacle);
                if (userData.fitnessFocus)
                    userData.fitnessFocus = JSON.parse(userData.fitnessFocus);
                if (userData.exerciseType)
                    userData.exerciseType = JSON.parse(userData.exerciseType);
                if (userData.dietaryPreference)
                    userData.dietaryPreference = JSON.parse(userData.dietaryPreference);
                // Convert to preferred units for Bubble API
                if (userData.weightUnit === 'lbs') {
                    if (userData.currentWeightLbs)
                        userData.currentWeight = userData.currentWeightLbs;
                    if (userData.goalWeightLbs)
                        userData.goalWeight = userData.goalWeightLbs;
                    if (userData.desiredWeightLossLbs)
                        userData.desiredWeightLoss = userData.desiredWeightLossLbs;
                    if (userData.weightToLoseLbs)
                        userData.weightToLose = userData.weightToLoseLbs;
                }
                if (userData.heightUnit === 'ft' && userData.heightFeet) {
                    userData.height = userData.heightFeet;
                }
                try {
                    yield axios_1.default.post('https://busybody-v1.bubbleapps.io/version-test/api/1.1/wf/wf-onboarding', userData, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    console.log('Successfully sent data to Bubble');
                    yield (0, discordWebhook_1.sendDiscordWebhook)(`Successfully sent data to Bubble for user: ${userEmail}`);
                }
                catch (bubbleError) {
                    console.error('Error sending data to Bubble:', bubbleError.response ? bubbleError.response.data : bubbleError.message);
                    yield (0, discordWebhook_1.sendDiscordWebhook)(`Error on bubble API call: ${bubbleError.message}`);
                }
            }
            catch (error) {
                console.error('Error updating user after payment:', error);
                yield (0, discordWebhook_1.sendDiscordWebhook)(`Error updating user after payment: ${error.message}`);
            }
            break;
        }
        default:
            yield (0, discordWebhook_1.sendDiscordWebhook)(`Unhandled event type ${event.type}`);
            console.log(`Unhandled event type ${event.type}`);
    }
    // Acknowledge receipt of the event
    return res.json({ received: true });
});
exports.handleStripeWebhook = handleStripeWebhook;
