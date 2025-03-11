// src/controllers/calculations.controller.ts
import { Request, Response } from 'express';

// Helper functions for unit conversion
const feetToCm = (feet: string): number => {
  if (feet.includes("'")) {
    // Handle format like "5'11"
    const parts = feet.split("'");
    const feetPart = parseInt(parts[0], 10);
    const inchesPart = parseInt(parts[1] || "0", 10);
    return Math.round((feetPart * 30.48) + (inchesPart * 2.54));
  } else if (feet.includes(".")) {
    // Handle decimal feet like "5.5"
    return Math.round(parseFloat(feet) * 30.48);
  } else {
    // Handle just feet like "5"
    return Math.round(parseInt(feet, 10) * 30.48);
  }
};

const cmToFeet = (cm: number): string => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}`;
};

const lbsToKg = (lbs: number): number => {
  return Math.round(lbs * 0.453592 * 10) / 10;
};

const kgToLbs = (kg: number): number => {
  return Math.round(kg * 2.20462 * 10) / 10;
};

export const calculateBMI = (req: Request, res: Response) => {
  const { height, weight, heightUnit = 'cm', weightUnit = 'kg' } = req.body;
  
  if (!height || !weight) {
    return res.status(400).json({ error: 'Height and weight are required' });
  }
  
  // Convert to cm and kg for calculation
  let heightInCm: number;
  if (heightUnit === 'ft' || heightUnit === 'feet') {
    heightInCm = feetToCm(height.toString());
  } else {
    heightInCm = parseFloat(height);
  }
  
  let weightInKg: number;
  if (weightUnit === 'lb' || weightUnit === 'lbs') {
    weightInKg = lbsToKg(parseFloat(weight));
  } else {
    weightInKg = parseFloat(weight);
  }
  
  // Calculate BMI
  const heightInMeters = heightInCm / 100;
  const bmi = weightInKg / (heightInMeters * heightInMeters);
  
  // Return result with both unit values
  return res.json({ 
    bmi: Math.round(bmi * 10) / 10,
    height: {
      cm: heightInCm,
      feet: cmToFeet(heightInCm)
    },
    weight: {
      kg: weightInKg,
      lbs: kgToLbs(weightInKg)
    }
  });
};

export const calculateTDEE = (req: Request, res: Response) => {
  const { 
    weight, 
    height, 
    age, 
    activityLevel, 
    gender = 'female',
    heightUnit = 'cm',
    weightUnit = 'kg'
  } = req.body;
  
  if (!weight || !height || !age || !activityLevel) {
    return res.status(400).json({ error: 'Weight, height, age, and activity level are required' });
  }
  
  // Convert to cm and kg for calculation
  let heightInCm: number;
  if (heightUnit === 'ft' || heightUnit === 'feet') {
    heightInCm = feetToCm(height.toString());
  } else {
    heightInCm = parseFloat(height);
  }
  
  let weightInKg: number;
  if (weightUnit === 'lb' || weightUnit === 'lbs') {
    weightInKg = lbsToKg(parseFloat(weight));
  } else {
    weightInKg = parseFloat(weight);
  }
  
  // BMR calculation (Mifflin-St Jeor)
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * parseFloat(age.toString()) + 5;
  } else {
    bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * parseFloat(age.toString()) - 161;
  }
  
  // Activity multiplier
  let multiplier = 1.2; // Default
  switch (activityLevel) {
    case 'Not Very Active': multiplier = 1.2; break;
    case 'Lightly Active': multiplier = 1.375; break;
    case 'Moderately Active': multiplier = 1.55; break;
    case 'Very Active': multiplier = 1.725; break;
  }
  
  const tdee = Math.round(bmr * multiplier);
  
  // Return result with both unit values
  return res.json({ 
    tdee,
    height: {
      cm: heightInCm,
      feet: cmToFeet(heightInCm)
    },
    weight: {
      kg: weightInKg,
      lbs: kgToLbs(weightInKg)
    }
  });
};

export const calculateWeightLossLength = (req: Request, res: Response) => {
  const { weightToLose, weightCutRate, weightUnit = 'kg' } = req.body;
  
  if (!weightToLose || !weightCutRate) {
    return res.status(400).json({ error: 'Weight to lose and cut rate are required' });
  }
  
  // Convert to kg for calculation if needed
  let weightToLoseKg: number;
  let weightCutRateKg: number;
  
  if (weightUnit === 'lb' || weightUnit === 'lbs') {
    weightToLoseKg = lbsToKg(parseFloat(weightToLose));
    weightCutRateKg = lbsToKg(parseFloat(weightCutRate));
  } else {
    weightToLoseKg = parseFloat(weightToLose);
    weightCutRateKg = parseFloat(weightCutRate);
  }
  
  const length = Math.ceil(weightToLoseKg / weightCutRateKg);
  
  // Return result with both unit values
  return res.json({ 
    weightLossLength: length,
    weightToLose: {
      kg: weightToLoseKg,
      lbs: kgToLbs(weightToLoseKg)
    },
    weightCutRate: {
      kg: weightCutRateKg,
      lbs: kgToLbs(weightCutRateKg)
    }
  });
};

export const calculateCalorieIntake = (req: Request, res: Response) => {
  const { tdee, calorieCut } = req.body;
  
  if (!tdee || !calorieCut) {
    return res.status(400).json({ error: 'TDEE and calorie cut are required' });
  }
  
  const calorieIntake = Math.round(parseFloat(tdee) - parseFloat(calorieCut));
  return res.json({ calorieIntake });
};