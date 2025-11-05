import { driverModel } from "../../db/Driver";
import { Utilities } from "../../utils/AuthUtilities";
import moment from "moment";
import mongoose = require('mongoose')
import { HTTP400Error, HTTP404Error } from "../../utils/httpErrors";
import { userModel } from "../../db/User";
import path from "path";
import { getLanguage } from "../../utils/getLanguage";
import { NextFunction } from "express";
import { EMAIL_OR_PHONE_ALREADY_IN_USE } from "../../utils/const";

export const requestOtp = async (req: any, body: any, next: any) => {
  try {
    const { email, phone, countryCode } = body;
    const locale = getLanguage(req);

    const query = [];
    if (email) query.push({ email });
    if (phone) query.push({ phone });

    const driver = await driverModel.findOne({
      $or: query,
      isDeleted: false,
    });

    const company = await userModel.findOne({
      $or: query,
      isDeleted: false,
    });

    if (company && company.isProfileRegistered) {
      return next(new HTTP400Error(EMAIL_OR_PHONE_ALREADY_IN_USE));
    }

    if (driver && driver.isProfileRegistered && driver.isProfileVerified) {
      return next(new HTTP400Error("DRIVER_NOT_VERIFIED"));
    }

    if (driver && driver.isDeleted) {
      return next(new HTTP400Error("ACCOUNT_DELETED"));
    }

    const drv = driver
      ? driver
      : new driverModel({
        email,
        phone,
        countryCode,
        role: "driver",
      });

    const otp = Utilities.generateOTP();
    drv.otp = otp;
    drv.otpExipredAt = moment().add(10, "minutes");
    await drv.save();

    return Utilities.sendResponsData({
      message: "OTP_SENT",
      data: { otp },
    });
  } catch (err) {
    next(err);
  }
};

export const resendOtp = async (req: any, body: any, next: any) => {
  try {
    const { email, phone } = body;
    const locale = getLanguage(req);

    if (!email && !phone) {
      return next(new HTTP400Error("EMAIL_OR_PHONE_REQUIRED"));
    }

    const query = [];
    if (email) query.push({ email });
    if (phone) query.push({ phone });

    const driver = await driverModel.findOne({
      $or: query,
      isDeleted: false,
    });

    if (!driver) {
      return next(new HTTP404Error("DRIVER_NOT_FOUND"));
    }

    if (driver.isDeleted) {
      return next(new HTTP400Error("ACCOUNT_DELETED"));
    }

    const otp = Utilities.generateOTP();
    driver.otp = otp;
    driver.otpExipredAt = moment().add(10, "minutes");
    await driver.save();

    return Utilities.sendResponsData({
      message: "OTP_RESENT_SUCCESSFULLY",
      data: { otp },
    });
  } catch (err) {
    next(err);
  }
};


export const verifyOtp = async (req: any, body: any, next: any) => {
  try {
    const { phone, countryCode, email, otp, fcmToken } = body;
    let locale = getLanguage(req);
    if (req.body.language) locale = req.body.language;

    let driver;

    if (email) {
      driver = await driverModel.findOne({ email, isDeleted: false });
    } else if (phone && countryCode) {
      driver = await driverModel.findOne({ phone, countryCode, isDeleted: false });
    }

    if (!driver || driver.otp !== otp) {
      return next(new HTTP400Error("INVALID_OTP"));
    }
    if (moment().isAfter(driver.otpExipredAt)) {
      return next(new HTTP400Error("OTP_EXPIRED"));
    }

    driver.otpVerified = true;
    driver.otp = "";
    driver.fcmToken = fcmToken || "";
    await driver.save();

    const token = await Utilities.createJWTToken({
      userId: driver._id,
      role: driver.role,
      email: driver.email,
      name: driver.name,
    });

    driver.accessToken = token;
    await driver.save();

    return Utilities.sendResponsData({
      message: "VERIFICATION_SUCCESSFUL",
      data: driver,
    });
  } catch (err) {
    next(err);
  }
};

export const registerProfile = async (token: any, req: any, next: any) => {
  try {
    let body = req.body;
    const decoded: any = await Utilities.getDecoded(token);
    const driverId = decoded.userId;
    let locale = getLanguage(req);
    if (body.language) locale = body.language;

    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return next(new HTTP400Error("INVALID_ID"));
    }

    const driver = await driverModel.findOne({
      _id: driverId,
      isDeleted: false,
    });

    if (!driver) {
      return next(new HTTP404Error("DRIVER_NOT_FOUND"));
    }

    const { name, email, countryCode, phone, vehicleType } = body;

    // Check duplicates across drivers (excluding current driver)
    const duplicateInDrivers = await driverModel.findOne({
      _id: { $ne: driverId },
      isDeleted: false,
      $or: [
        { email },
        { countryCode, phone },
      ],
    });

    // Check duplicates in companies
    const duplicateInCompanies = await userModel.findOne({
      isDeleted: false,
      $or: [
        { email },
        { countryCode, phone },
      ],
    });
    console.log('duplicateInDrivers==>', duplicateInDrivers)
    console.log('duplicateInCompanies==>', duplicateInCompanies)

    if (duplicateInDrivers || duplicateInCompanies) {
      return next(new HTTP400Error("EMAIL_OR_PHONE_ALREADY_IN_USE"));
    }

    const docs =
      (req.files as Express.Multer.File[] | undefined)?.map((f) => {
        const fileName = path.basename(f.path);               // 1752579411489_ttttt.png
        return `uploads/drivers/${fileName}`;                 // uploads/drivers/...
      }) || [];

    if (req.file) {
      const fileName = path.basename(req.file.path);           // e.g.  1699999999_avatar.png
      driver.profilePicture = `uploads/drivers/${fileName}`;   // stored path
    }


    driver.name = name;
    driver.email = email;
    driver.phone = phone;
    driver.countryCode = countryCode;
    // driver.licenceNo = licenceNo;
    driver.vehicleType = vehicleType;
    // driver.documents = docs.length ? docs : driver.documents;
    driver.updatedBy = driverId;
    driver.isProfileRegistered = true;

    driver.updatedAt = moment();

    await driver.save();
    return Utilities.sendResponsData({
      message: "DRIVER_PROFILE_UPDATED",
      data: driver,
    });
  } catch (err) {
    next(err);
  }
};

function upsertDoc(arr: { key: string; value: string }[], key: string, value: string) {
  const idx = arr.findIndex((d) => d.key === key);
  if (idx > -1) arr[idx].value = value;
  else arr.push({ key, value });
}

export const uploadCompanyDocsController = async (req: any, next: NextFunction) => {
  try {
    const locale = getLanguage(req);
    const decoded: any = req.user; // injected by auth middleware
    const driverId = decoded.userId;

    const driver = await driverModel.findOne({ _id: driverId, isDeleted: false });
    if (!driver) return next(new HTTP404Error("USER_NOT_FOUND"));

    const fileMap: Record<string, string> = {};
    const files = req.files as Record<string, Express.Multer.File[]>;

    Object.entries(files).forEach(([key, fileArray]) => {
      const filePath = fileArray?.[0]?.path;
      if (filePath) {
        const fileName = path.basename(filePath); // extract filename from full path
        fileMap[key] = `uploads/drivers/${fileName}`; // save as relative path
      }
    });

    driver.documents = Object.entries(fileMap).map(([key, value]) => ({ key, value }));

    driver.updatedAt = new Date();
    await driver.save();

    return Utilities.sendResponsData({
      message: "DOCUMENTS_UPLOADED_SUCCESS",
      data: { userDetail: driver },
    });

  } catch (err) {
    next(err);
  }
};

export const getDriverProfile = async (token: any, req: any, next: any) => {
  try {
    const locale = getLanguage(req);
    const decoded: any = await Utilities.getDecoded(token);
    const driverId = decoded.userId;

    const driver = await driverModel.findOne({
      _id: driverId,
      isDeleted: false,
    });

    if (!driver) {
      return next(new HTTP404Error("DRIVER_NOT_FOUND"));
    }

    delete driver.password;

    return Utilities.sendResponsData({
      message: "PROFILE_FETCHED_SUCCESS",
      data: driver,
    });
  } catch (err) { next(err); }
};
