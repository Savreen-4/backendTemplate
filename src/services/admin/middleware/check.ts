import { Request, Response, NextFunction } from 'express';
import { driverModel } from '../../../db/Driver';
import { userModel } from '../../../db/User';
import jwt, { JwtPayload } from "jsonwebtoken";
import { ADMIN_ROLE, AUTHORIZATION, COMPANY_ROLE, DRIVER_ROLE } from '../../../utils/const';
import { HTTP400Error, HTTP401Error, HTTP403Error } from '../../../utils/httpErrors';
import { getLanguage } from '../../../utils/getLanguage';
type Expect = "driver" | "company" | "admin" | "either";

const coreAuth = async (
    req: Request,
    res: Response,
    next: NextFunction,
    expect: Expect
) => {
    const token = req.get(AUTHORIZATION);
    let locale = getLanguage(req);
    if (!token) {
        return next(new HTTP400Error("TOKEN_REQUIRED"));
    }

    try {
        const jwtSecretKey = process.env.JWT_SECRET_KEY || "your_default_fallback";
        const decoded: any = jwt.verify(token, jwtSecretKey);
        const userId = decoded.userId;
        const [driver, company] = await Promise.all([
            driverModel.findById(userId),
            userModel.findById(userId),
        ]);

        const account = driver || company;

        if (!account || account.accessToken !== token) {
            return next(new HTTP401Error("TOKEN_REVOKED"));
        }

        const accountRole =
            driver ? DRIVER_ROLE : company?.role?.toLowerCase() === ADMIN_ROLE ? ADMIN_ROLE : COMPANY_ROLE;

        const forbidden =
            (expect === DRIVER_ROLE && accountRole !== DRIVER_ROLE) ||
            (expect === COMPANY_ROLE && accountRole !== COMPANY_ROLE) ||
            (expect === ADMIN_ROLE && accountRole !== ADMIN_ROLE);

        if (forbidden) {
            return next(new HTTP403Error("ACCESS_FORBIDDEN"));
        }

        (req as any).user = decoded;
        next();
    } catch (err: any) {
        console.error("JWT Error:", err);
        const msgKey =
            err.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "INVALID_TOKEN";
        return next(new HTTP401Error(msgKey));
    }
};

export const checkAuthenticate = (req: Request, res: Response, next: NextFunction) =>
    coreAuth(req, res, next, "either");

export const checkDriverAuthenticate = (req: Request, res: Response, next: NextFunction) =>
    coreAuth(req, res, next, "driver");

export const checkCompanyAuthenticate = (req: Request, res: Response, next: NextFunction) =>
    coreAuth(req, res, next, "company");

export const checkAdminAuthenticate = (req: Request, res: Response, next: NextFunction) =>
    coreAuth(req, res, next, ADMIN_ROLE);

