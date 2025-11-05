import jwt, { JwtPayload } from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { checkEnvVar } from "./helpers";
import 'dotenv/config';
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10");

export class Utilities {

  public static sendResponsData(response: any) {
    let result: any = {
      // responseCode: response.code,
      responseMessage: response.message,
    };
    
    if (response.data) {
      result.data = response.data;
    }
    if (response.totalRecord) {
      result.totalRecord = response.totalRecord;
    }
    if(response.pagination){
      result.pagination = response.pagination
    }

    return result;
  }

  public static cryptPassword = async (password: string) => {    
    return new Promise(function (resolve, reject) {
      return bcrypt.hash(
        password,
        SALT_ROUNDS,
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
    return jwt.sign(payload, checkEnvVar('JWT_SECRET_KEY'), {});
  };

  public static getDecoded = async (token: any) => {
    return jwt.decode(token);
  };
}

