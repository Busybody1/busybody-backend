import { Request, Response } from 'express';
import sequelize from './config/db.config';

export const healthCheck = async (req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ status: 'OK', database: 'connected' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ status: 'ERROR', database: 'disconnected' });
  }
};
