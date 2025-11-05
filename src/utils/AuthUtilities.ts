import jwt from "jsonwebtoken";
import config from "config";
import * as bcrypt from "bcrypt";
import { randomInt } from "crypto";

export const checkEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not defined in environment variables`);
  }
  return value;
};

export class Utilities {

  public static sendResponsData(response: any) {    
    let result: any = {
      responseMessage: response.message,
    };

    if (response.data) {
      result.data = response.data;
    }
    if (response.totalRecord) {
      result.totalRecord = response.totalRecord;
    }
    if (response.pagination) {
      result.pagination = response.pagination
    }
    return result;
  }

  public static cryptPassword = async (password: string) => {
    return new Promise(function (resolve, reject) {
      return bcrypt.hash(
        password,
        10,
        (err: any, hash: any) => {
          if (err) {
            return reject(err);
          } else {
            return resolve(hash);
          }
        }
      );
    });
  };

  public static createJWTToken = async (payload: any) => {
    const secretKey = checkEnvVar('JWT_SECRET_KEY');
    if (typeof secretKey !== 'string') {
      throw new Error('JWT_SECRET_KEY is not defined or not a string');
    }

    return jwt.sign(payload, secretKey, {});
  };

  public static getDecoded = async (token: any) => {
    return jwt.decode(token);
  };

  public static generateOTP(length = 6): string {
    const max = 10 ** length;
    const otp = randomInt(0, max);
    return otp.toString().padStart(length, "0");
  }

}