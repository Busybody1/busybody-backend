"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/user.routes.ts
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const calculations_controller_1 = require("../controllers/calculations.controller");
const router = express_1.default.Router();
// User management routes
router.post('/start-signup', user_controller_1.startSignup);
router.post('/', user_controller_1.createUser);
router.get('/:id', user_controller_1.getUser);
router.get('/data', user_controller_1.getUserData);
router.post('/checkout', user_controller_1.calculateAndRedirectToStripe);
router.post('/update-status', user_controller_1.updateUserStatus);
// Calculation routes
router.post('/calculate/bmi', calculations_controller_1.calculateBMI);
router.post('/calculate/tdee', calculations_controller_1.calculateTDEE);
router.post('/calculate/weight-loss-length', calculations_controller_1.calculateWeightLossLength);
router.post('/calculate/calorie-intake', calculations_controller_1.calculateCalorieIntake);
exports.default = router;
