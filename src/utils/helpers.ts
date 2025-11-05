import mongoose = require("mongoose");
import jwt from 'jsonwebtoken';

export const checkEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not defined in environment variables`);
  }
  return value;
};

export const Utilities = {
  generateOTP: () => Math.floor(100000 + Math.random() * 900000).toString(),
  generateToken: (payload: any) => jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' }),
  cryptPassword: async (password: string) => {
    const bcrypt = require('bcrypt');
    return await bcrypt.hash(password, 10);
  },
  sendResponsData: ({ data = null, message = 'Success' }) => ({ message, data }),
};