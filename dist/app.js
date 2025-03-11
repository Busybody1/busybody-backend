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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const db_config_1 = __importDefault(require("./config/db.config"));
const healthCheck_1 = require("./healthCheck");
const stripe_controller_1 = require("./controllers/stripe.controller");
const discordWebhook_1 = require("./config/utils/discordWebhook");
const app = (0, express_1.default)();
// Middleware
const corsOptions = {
    origin: [
        'https://landing.busybody.io',
        'https://signup.busybody.io',
        'https://busybody-21510f.webflow.io'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, helmet_1.default)());
// IMPORTANT: Use express.raw() BEFORE express.json() for Stripe webhooks
app.use('/api/stripe/webhook', express_1.default.raw({ type: 'application/json' }));
app.use(express_1.default.json());
// Routes
app.use('/api/users', user_routes_1.default);
app.get('/api/health', healthCheck_1.healthCheck);
app.post('/api/stripe/webhook', stripe_controller_1.handleStripeWebhook);
app.post('/mailchimp', express_1.default.json(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, name, checkoutLink, discountCode } = req.body;
        console.log("Data received", { email, name, checkoutLink, discountCode });
        if (!email || !name || !checkoutLink) {
            return res.status(400).json({ message: 'Missing required data' });
        }
        // Add your Mailchimp API call here if needed.
        return res.status(200).json({ message: "OK" });
    }
    catch (error) {
        console.error('Error with Mailchimp proxy:', error);
        yield (0, discordWebhook_1.sendDiscordWebhook)(`Error with mailchimp proxy: ${error.message}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// Database Connection
db_config_1.default.sync()
    .then(() => {
    console.log('Database connected.');
})
    .catch((err) => __awaiter(void 0, void 0, void 0, function* () {
    console.error('Unable to connect to the database:', err);
}));
exports.default = app;
