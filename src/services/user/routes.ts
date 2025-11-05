import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { getDriverProfile, registerProfile, requestOtp, uploadCompanyDocsController, verifyOtp } from "./controller";
import { validateCompanyDocs, validateEmailOrPhone, validateRegisterProfile, validateVerifyOtp } from "./middleware/check";
import { AUTHORIZATION } from "../../utils/const";
import { checkDriverAuthenticate } from "../admin/middleware/check";
import { uploadCompanyDocs, uploadSinglePhoto } from "../../utils/localUpload";
dotenv.config();
const basePath = process.env.BASE_PATH;
const driverPath = 'user/';
const currentPathURL = basePath;
const basePathURL = currentPathURL + driverPath

export default [
  {
    path: basePathURL + "request-otp",
    method: "post",
    handler: [
      validateEmailOrPhone,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await requestOtp(req, req.body, next);
        res.status(200).send(result);
      },
    ],
  },
  {
    path: basePathURL + "verify-otp",
    method: "post",
    handler: [
      validateVerifyOtp,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await verifyOtp(req, req.body, next);
        res.status(200).send(result);
      },
    ],
  },
  {
    path: basePathURL + "register-profile",
    method: "post",
    handler: [
      uploadSinglePhoto,
      checkDriverAuthenticate,
      validateRegisterProfile,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await registerProfile(req.get(AUTHORIZATION), req, next);
        res.status(200).send(result);
      },
    ],
  },

  {
    path: basePathURL + "upload-documents",
    method: "post",
    handler: [
      uploadCompanyDocs,
      checkDriverAuthenticate,
      validateCompanyDocs,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await uploadCompanyDocsController(req, next);
        res.status(200).send(result);
      },
    ],
  },
  {
    path: basePathURL + "profile",
    method: "get",
    handler: [
      checkDriverAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await getDriverProfile(req.get(AUTHORIZATION), req, next);
        res.status(200).send(result);
      },
    ],
  }

];
