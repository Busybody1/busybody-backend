// src/models/user.model.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.config';

class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string | null;
  public paid!: boolean;
  public status!: string;
  public checkoutLink!: string | null;
  public tempUserId!: string | null;

  // Additional fields
  public activityLevels!: string | null;
  public currentWeight!: number | null;
  public currentWeightLbs!: number | null;
  public desiredWeightLoss!: number | null;
  public desiredWeightLossLbs!: number | null;
  public goalWeight!: number | null;
  public goalWeightLbs!: number | null;
  public height!: number | null;
  public heightFeet!: string | null;
  public idealPhotoLink!: string | null;
  public looksGoal!: string | null;
  public startingBodyFat!: string | null;
  public fitnessLevel!: string | null;
  public weeklyExercise!: string | null;
  public sleepHours!: number | null;
  public age!: number | null;
  public bmi!: number | null;
  public tdee!: number | null;
  public calorieIntake!: number | null;
  public selectedCalorieCut!: number | null;
  public weightLoseLength!: number | null;
  public weightToLose!: number | null;
  public weightToLoseLbs!: number | null;
  
  // Unit preferences
  public heightUnit!: string | null;
  public weightUnit!: string | null;

  // JSON fields
  public obstacle!: string | null;
  public fitnessFocus!: string | null;
  public exerciseType!: string | null;
  public dietaryPreference!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
      allowNull: true,
    },
    tempUserId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Additional fields with both metric and imperial units
    activityLevels: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    currentWeight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    currentWeightLbs: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    desiredWeightLoss: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    desiredWeightLossLbs: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    goalWeight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    goalWeightLbs: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    height: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    heightFeet: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    idealPhotoLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    looksGoal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    startingBodyFat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fitnessLevel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    weeklyExercise: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sleepHours: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bmi: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    tdee: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    calorieIntake: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    selectedCalorieCut: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    weightLoseLength: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    weightToLose: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    weightToLoseLbs: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    
    // Unit preferences
    heightUnit: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'cm',
    },
    weightUnit: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'kg',
    },

    obstacle: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    fitnessFocus: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    exerciseType: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    dietaryPreference: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      beforeCreate: (user: any) => {
        if (user.obstacle) user.obstacle = JSON.stringify(user.obstacle);
        if (user.fitnessFocus) user.fitnessFocus = JSON.stringify(user.fitnessFocus);
        if (user.exerciseType) user.exerciseType = JSON.stringify(user.exerciseType);
        if (user.dietaryPreference) user.dietaryPreference = JSON.stringify(user.dietaryPreference);
      },
      beforeUpdate: (user: any) => {
        if (user.obstacle) user.obstacle = JSON.stringify(user.obstacle);
        if (user.fitnessFocus) user.fitnessFocus = JSON.stringify(user.fitnessFocus);
        if (user.exerciseType) user.exerciseType = JSON.stringify(user.exerciseType);
        if (user.dietaryPreference) user.dietaryPreference = JSON.stringify(user.dietaryPreference);
      },
    },
  }
);

export default User;