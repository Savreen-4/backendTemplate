import { Request, Response, NextFunction } from "express";
import {
  adminLogin,
  createAdmin
} from "./controller";
import dotenv from "dotenv";
dotenv.config();
const basePath = process.env.BASE_PATH;
const adminPath = 'admin/';
const currentPathURL = basePath;
const adminPathURL = currentPathURL + adminPath

export default [

  {
    path: adminPathURL + "createAdmin",
    method: "post",
    handler: [
      async (req: Request, res: Response) => {
        const result = await createAdmin(req, res);
        res.status(200).send(result);
      },
    ],
  },

  {
    path: adminPathURL + "login",
    method: "post",
    handler: [
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await adminLogin(req, req.body, res, next);
        res.status(200).send(result);
      },
    ],
  }
];
