// src/routes/user.routes.ts
import express from 'express';
import { 
    createUser, 
    getUser, 
    calculateAndRedirectToStripe, 
    updateUserStatus, 
    startSignup,
    getUserData
} from '../controllers/user.controller';
import {
    calculateBMI,
    calculateTDEE,
    calculateWeightLossLength,
    calculateCalorieIntake
} from '../controllers/calculations.controller';

const router = express.Router();

// User management routes
router.post('/start-signup', startSignup);
router.post('/', createUser);
router.get('/:id', getUser);
router.get('/data', getUserData);
router.post('/checkout', calculateAndRedirectToStripe);
router.post('/update-status', updateUserStatus);

// Calculation routes
router.post('/calculate/bmi', calculateBMI);
router.post('/calculate/tdee', calculateTDEE);
router.post('/calculate/weight-loss-length', calculateWeightLossLength);
router.post('/calculate/calorie-intake', calculateCalorieIntake);

export default router;