import { Utilities } from "./AuthUtilities";
import { Request, Response, NextFunction } from "express";

export const errorMessageHander =  (data:any) => {
  let errorArr:any = [];
  Object.keys(data).forEach(function(key) {
      errorArr.push(data[key].message);
  });
  return errorArr;
};

export const handleServerError = (error: any, res: any) => {
  let statusCode = 500;
  let errorMessage = error?.message || "Internal Server Error";
  try {
    const parsed = JSON.parse(errorMessage);
    if (parsed?.responseMessage || parsed?.responseCode) {
      errorMessage = parsed.responseMessage || errorMessage;
      statusCode = parsed.responseCode || 500;
    }
  } catch (_) {
    // Ignore JSON parse errors — fallback to plain string
  }

  return res.status(statusCode).json(
    Utilities.sendResponsData({
      message: errorMessage,
    })
  );
};

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err && err.statusCode) {
    return res.status(err.statusCode).json({
      responseMessage: err.message,      
    });
  }

  console.error(err);
  res.status(500).json({ responseMessage: "Internal Server Error" });
};
