"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/user.model.ts
const sequelize_1 = require("sequelize");
const db_config_1 = __importDefault(require("../config/db.config"));
class User extends sequelize_1.Model {
}
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    paid: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: 'signupAbandoned',
        validate: {
            isIn: [
                [
                    'signupAbandoned',
                    'paymentInitiated',
                    'checkoutAbandoned',
                    'paymentCompleted',
                    'signupStarted',
                ],
            ],
        },
    },
    checkoutLink: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    tempUserId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    // Additional fields with both metric and imperial units
    activityLevels: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    currentWeight: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    currentWeightLbs: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    desiredWeightLoss: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    desiredWeightLossLbs: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    goalWeight: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    goalWeightLbs: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    height: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    heightFeet: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    idealPhotoLink: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    looksGoal: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    startingBodyFat: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    fitnessLevel: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    weeklyExercise: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    sleepHours: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    age: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    bmi: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    tdee: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    calorieIntake: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    selectedCalorieCut: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    weightLoseLength: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    weightToLose: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    weightToLoseLbs: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    // Unit preferences
    heightUnit: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: 'cm',
    },
    weightUnit: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: 'kg',
    },
    obstacle: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    fitnessFocus: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    exerciseType: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    dietaryPreference: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
}, {
    sequelize: db_config_1.default,
    modelName: 'User',
    tableName: 'users',
    hooks: {
        beforeCreate: (user) => {
            if (user.obstacle)
                user.obstacle = JSON.stringify(user.obstacle);
            if (user.fitnessFocus)
                user.fitnessFocus = JSON.stringify(user.fitnessFocus);
            if (user.exerciseType)
                user.exerciseType = JSON.stringify(user.exerciseType);
            if (user.dietaryPreference)
                user.dietaryPreference = JSON.stringify(user.dietaryPreference);
        },
        beforeUpdate: (user) => {
            if (user.obstacle)
                user.obstacle = JSON.stringify(user.obstacle);
            if (user.fitnessFocus)
                user.fitnessFocus = JSON.stringify(user.fitnessFocus);
            if (user.exerciseType)
                user.exerciseType = JSON.stringify(user.exerciseType);
            if (user.dietaryPreference)
                user.dietaryPreference = JSON.stringify(user.dietaryPreference);
        },
    },
});
exports.default = User;
