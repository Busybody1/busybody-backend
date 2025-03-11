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
exports.getUserData = exports.updateUserStatus = exports.calculateAndRedirectToStripe = exports.getUser = exports.createUser = exports.startSignup = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const discordWebhook_1 = require("../config/utils/discordWebhook");
const stripe_config_1 = __importDefault(require("../config/stripe.config"));
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
// Helper functions for unit conversion
const feetToCm = (feet) => {
    if (feet.includes("'")) {
        // Handle format like "5'11"
        const parts = feet.split("'");
        const feetPart = parseInt(parts[0], 10);
        const inchesPart = parseInt(parts[1] || "0", 10);
        return Math.round((feetPart * 30.48) + (inchesPart * 2.54));
    }
    else if (feet.includes(".")) {
        // Handle decimal feet like "5.5"
        return Math.round(parseFloat(feet) * 30.48);
    }
    else {
        // Handle just feet like "5"
        return Math.round(parseInt(feet, 10) * 30.48);
    }
};
const cmToFeet = (cm) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}`;
};
const lbsToKg = (lbs) => {
    return Math.round(lbs * 0.453592 * 10) / 10;
};
const kgToLbs = (kg) => {
    return Math.round(kg * 2.20462 * 10) / 10;
};
// --- Helper Function to Calculate Price ---
const calculatePrice = (weightLoseLength) => {
    if (weightLoseLength < 5) {
        return 1299;
    }
    else if (weightLoseLength >= 5 && weightLoseLength <= 8) {
        return 1499;
    }
    else if (weightLoseLength >= 9 && weightLoseLength <= 12) {
        return 1999;
    }
    else {
        return 2499;
    }
};
// --- Start Signup (Create a temporary user) ---
const startSignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tempUserId = (0, uuid_1.v4)();
        const user = yield user_model_1.default.create({
            tempUserId,
            status: 'signupStarted',
            name: 'New User' // Adding default name since it's required
        });
        return res.status(201).json({ tempUserId: user.tempUserId });
    }
    catch (error) {
        console.error('Error starting signup:', error);
        yield (0, discordWebhook_1.sendDiscordWebhook)(`Error starting signup: ${error.message}`);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.startSignup = startSignup;
// --- Create or Update User with Unit Conversion ---
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = req.body;
        // Handle unit conversions
        if (userData.height) {
            if (userData.heightUnit === 'ft') {
                // Convert height from feet to cm
                const heightInCm = feetToCm(userData.height.toString());
                userData.height = heightInCm;
                userData.heightFeet = userData.height.toString(); // Store original feet value
            }
            else {
                // Store both cm and feet equivalent
                userData.heightFeet = cmToFeet(parseFloat(userData.height.toString()));
            }
        }
        if (userData.currentWeight) {
            if (userData.weightUnit === 'lbs') {
                // Convert weight from lbs to kg
                userData.currentWeightLbs = userData.currentWeight;
                userData.currentWeight = lbsToKg(userData.currentWeight);
            }
            else {
                // Store both kg and lbs equivalent
                userData.currentWeightLbs = kgToLbs(userData.currentWeight);
            }
        }
        if (userData.goalWeight) {
            if (userData.weightUnit === 'lbs') {
                // Convert goal weight from lbs to kg
                userData.goalWeightLbs = userData.goalWeight;
                userData.goalWeight = lbsToKg(userData.goalWeight);
            }
            else {
                // Store both kg and lbs equivalent
                userData.goalWeightLbs = kgToLbs(userData.goalWeight);
            }
        }
        if (userData.desiredWeightLoss) {
            if (userData.weightUnit === 'lbs') {
                // Convert desired weight loss from lbs to kg
                userData.desiredWeightLossLbs = userData.desiredWeightLoss;
                userData.desiredWeightLoss = lbsToKg(userData.desiredWeightLoss);
            }
            else {
                // Store both kg and lbs equivalent
                userData.desiredWeightLossLbs = kgToLbs(userData.desiredWeightLoss);
            }
        }
        if (userData.weightToLose) {
            if (userData.weightUnit === 'lbs') {
                // Convert weight to lose from lbs to kg
                userData.weightToLoseLbs = userData.weightToLose;
                userData.weightToLose = lbsToKg(userData.weightToLose);
            }
            else {
                // Store both kg and lbs equivalent
                userData.weightToLoseLbs = kgToLbs(userData.weightToLose);
            }
        }
        let user;
        if (userData.tempUserId) {
            // Try to find the user by temporary ID
            user = yield user_model_1.default.findOne({ where: { tempUserId: userData.tempUserId } });
        }
        if (!user && userData.email) {
            // If not found by tempUserId, try by email
            user = yield user_model_1.default.findOne({ where: { email: userData.email } });
        }
        if (user) {
            yield user.update(userData);
            return res.status(200).json(user);
        }
        else {
            // Make sure name is provided, even if temporary
            if (!userData.name) {
                userData.name = 'New User';
            }
            user = yield user_model_1.default.create(userData);
            return res.status(201).json(user);
        }
    }
    catch (error) {
        console.error(error);
        yield (0, discordWebhook_1.sendDiscordWebhook)(`Error creating/updating user: ${error.message}`);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.createUser = createUser;
// --- Get User with Preferred Units ---
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const user = yield user_model_1.default.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userJSON = user.toJSON();
        // Parse JSON fields
        userJSON.obstacle = JSON.parse(userJSON.obstacle || '[]');
        userJSON.fitnessFocus = JSON.parse(userJSON.fitnessFocus || '[]');
        userJSON.exerciseType = JSON.parse(userJSON.exerciseType || '[]');
        userJSON.dietaryPreference = JSON.parse(userJSON.dietaryPreference || '[]');
        // Convert to preferred units for response
        if (userJSON.weightUnit === 'lbs') {
            // If user prefers lbs, use lbs values
            if (userJSON.currentWeightLbs)
                userJSON.currentWeight = userJSON.currentWeightLbs;
            if (userJSON.goalWeightLbs)
                userJSON.goalWeight = userJSON.goalWeightLbs;
            if (userJSON.desiredWeightLossLbs)
                userJSON.desiredWeightLoss = userJSON.desiredWeightLossLbs;
            if (userJSON.weightToLoseLbs)
                userJSON.weightToLose = userJSON.weightToLoseLbs;
        }
        if (userJSON.heightUnit === 'ft' && userJSON.heightFeet) {
            // If user prefers feet, use feet value
            userJSON.height = userJSON.heightFeet;
        }
        return res.status(200).json(userJSON);
    }
    catch (error) {
        console.error(error);
        yield (0, discordWebhook_1.sendDiscordWebhook)(`Error getting user: ${error.message}`);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.getUser = getUser;
// --- Calculate Price and Create Stripe Session (Fixed Stripe Integration) ---
const calculateAndRedirectToStripe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Accept either tempUserId or email
        const { tempUserId, email } = req.body;
        if (!tempUserId && !email) {
            return res.status(400).json({ message: "Either tempUserId or email is required" });
        }
        let user;
        if (tempUserId) {
            user = yield user_model_1.default.findOne({ where: { tempUserId } });
        }
        else {
            user = yield user_model_1.default.findOne({ where: { email } });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userJSON = user.toJSON();
        const weightLoseLength = userJSON.weightLoseLength || 4; // Default to 4 weeks
        try {
            // First create a coupon for 10% off
            const coupon = yield stripe_config_1.default.coupons.create({
                percent_off: 10,
                duration: 'once',
            });
            // Then create the Stripe checkout session
            const session = yield stripe_config_1.default.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'Personalized Weight Loss Plan',
                                description: `${weightLoseLength}-week customized plan`,
                            },
                            unit_amount_decimal: (18.97 * 100 * weightLoseLength).toString(), // $18.97 per week in cents
                        },
                        quantity: 1,
                    }],
                discounts: [{
                        coupon: coupon.id,
                    }],
                mode: 'payment',
                success_url: `https://signup.busybody.io/success`,
                cancel_url: `https://signup.busybody.io/`,
                metadata: {
                    userId: user.id.toString(),
                    userEmail: user.email,
                    tempUserId: user.tempUserId,
                },
            });
            // Update user status and save checkout link
            yield user.update({
                status: 'paymentInitiated',
                checkoutLink: session.url,
                discountCode: coupon.id
            });
            // Return the URL rather than redirecting
            return res.status(200).json({
                checkoutUrl: session.url,
                discountCode: coupon.id
            });
        }
        catch (stripeError) {
            console.error('Stripe error:', stripeError);
            yield (0, discordWebhook_1.sendDiscordWebhook)(`Stripe error: ${stripeError.message}`);
            return res.status(500).json({ message: 'Error creating Stripe session', error: stripeError.message });
        }
    }
    catch (error) {
        console.error(error);
        yield (0, discordWebhook_1.sendDiscordWebhook)(`Error creating Stripe session: ${error.message}`);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.calculateAndRedirectToStripe = calculateAndRedirectToStripe;
const updateUserStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, tempUserId, status } = req.body;
        if ((!email && !tempUserId) || !status) {
            return res.status(400).json({ message: 'Either email or tempUserId, and status are required' });
        }
        let user;
        if (email) {
            user = yield user_model_1.default.findOne({ where: { email } });
        }
        else if (tempUserId) {
            user = yield user_model_1.default.findOne({ where: { tempUserId } });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        yield user.update({ status });
        // If status is 'checkoutAbandoned', trigger the Mailchimp API call
        if (status === 'checkoutAbandoned') {
            const userJSON = user.toJSON();
            try {
                yield axios_1.default.post("https://busybody-backend-01de98e98c14.herokuapp.com/mailchimp", {
                    email: userJSON.email,
                    name: userJSON.name,
                    checkoutLink: userJSON.checkoutLink,
                    discountCode: userJSON.discountCode || "",
                });
            }
            catch (mailchimpError) {
                console.error('Error calling Mailchimp API:', mailchimpError.response ? mailchimpError.response.data : mailchimpError.message);
                yield (0, discordWebhook_1.sendDiscordWebhook)(`Error calling Mailchimp API: ${mailchimpError.message}`);
            }
        }
        return res.status(200).json({ message: 'Status updated successfully' });
    }
    catch (error) {
        console.error('Error updating user status:', error);
        yield (0, discordWebhook_1.sendDiscordWebhook)(`Error updating user status: ${error.message}`);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.updateUserStatus = updateUserStatus;
// --- Get User Data with Preferred Units ---
const getUserData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, tempUserId, email, fields } = req.query;
        if (!userId && !tempUserId && !email) {
            return res.status(400).json({ message: 'User identifier is required' });
        }
        let user;
        if (userId) {
            user = yield user_model_1.default.findByPk(userId);
        }
        else if (tempUserId) {
            user = yield user_model_1.default.findOne({ where: { tempUserId: tempUserId } });
        }
        else if (email) {
            user = yield user_model_1.default.findOne({ where: { email: email } });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userJson = user.toJSON();
        // Parse JSON fields
        if (userJson.obstacle)
            userJson.obstacle = JSON.parse(userJson.obstacle);
        if (userJson.fitnessFocus)
            userJson.fitnessFocus = JSON.parse(userJson.fitnessFocus);
        if (userJson.exerciseType)
            userJson.exerciseType = JSON.parse(userJson.exerciseType);
        if (userJson.dietaryPreference)
            userJson.dietaryPreference = JSON.parse(userJson.dietaryPreference);
        // Convert to preferred units for response
        if (userJson.weightUnit === 'lbs') {
            // If user prefers lbs, use lbs values
            if (userJson.currentWeightLbs)
                userJson.currentWeight = userJson.currentWeightLbs;
            if (userJson.goalWeightLbs)
                userJson.goalWeight = userJson.goalWeightLbs;
            if (userJson.desiredWeightLossLbs)
                userJson.desiredWeightLoss = userJson.desiredWeightLossLbs;
            if (userJson.weightToLoseLbs)
                userJson.weightToLose = userJson.weightToLoseLbs;
        }
        if (userJson.heightUnit === 'ft' && userJson.heightFeet) {
            // If user prefers feet, use feet value
            userJson.height = userJson.heightFeet;
        }
        // If specific fields were requested, return only those
        if (fields) {
            const requestedFields = fields.split(',');
            const filteredData = {};
            requestedFields.forEach(field => {
                if (field in userJson) {
                    filteredData[field] = userJson[field];
                }
            });
            return res.status(200).json(filteredData);
        }
        // Otherwise return all data
        return res.status(200).json(userJson);
    }
    catch (error) {
        console.error(error);
        yield (0, discordWebhook_1.sendDiscordWebhook)(`Error retrieving user data: ${error.message}`);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.getUserData = getUserData;
