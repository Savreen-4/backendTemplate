import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { HTTP400Error } from '../../../utils/httpErrors';
import { errorMessageHander } from '../../../utils/ErrorHandler';
import { emailRegex, phoneRegex } from '../../../utils/const';
import { getLanguage } from '../../../utils/getLanguage';

export const validateEmailOrPhone = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const locale = getLanguage(req);

  const schema = Joi.object({
    email: Joi.string().pattern(emailRegex).messages({
      "string.pattern.base": "INVALID_EMAIL",
    }),

    phone: Joi.string().pattern(phoneRegex).messages({
      "string.pattern.base": "INVALID_PHONE",
    }),

    countryCode: Joi.string().when("phone", {
      is: Joi.exist(),
      then: Joi.string().required().messages({
        "any.required": "COUNTRY_CODE_REQUIRED",
        "string.empty": "COUNTRY_CODE_REQUIRED",
      }),
      otherwise: Joi.forbidden(), // Don't allow countryCode without phone
    }),
  })
    .or("email", "phone")
    .messages({
      "object.missing": "EMAIL_OR_PHONE_REQUIRED",
    });

  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return next(new HTTP400Error(error.details[0].message));
  }

  req.body = value;
  next();
};

export const validateVerifyOtp = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  let locale = getLanguage(req);
  if (req.body.language) locale = req.body.language;

  const schema = Joi.object({
    email: Joi.string().email().messages({
      "string.email": "INVALID_EMAIL",
    }),

    phone: Joi.string().pattern(/^[0-9]{6,15}$/).messages({
      "string.pattern.base": "INVALID_PHONE",
      "string.empty": "PHONE_REQUIRED",
    }),

    countryCode: Joi.string().messages({
      "string.empty": "COUNTRY_CODE_REQUIRED",
    }),

    otp: Joi.string().length(6).required().messages({
      "string.empty": "OTP_REQUIRED",
      "string.length": "OTP_LENGTH",
      "any.required": "OTP_REQUIRED",
    }),

    fcmToken: Joi.string().allow("", null).optional().messages({
      "string.base": "FCM_MUST_BE_STRING",
    })
  }).custom((value, helpers) => {
    const hasEmail = !!value.email;
    const hasPhone = !!value.phone && !!value.countryCode;

    if (!hasEmail && !hasPhone) {
      return helpers.error("any.custom", {
        message: "EMAIL_OR_PHONE_REQUIRED",
      });
    }

    if (hasEmail && hasPhone) {
      return helpers.error("any.custom", {
        message: "USE_ONLY_ONE_METHOD",
      });
    }

    if (value.phone && !value.countryCode) {
      return helpers.error("any.custom", {
        message: "COUNTRY_CODE_REQUIRED",
      });
    }

    if (!value.phone && value.countryCode) {
      return helpers.error("any.custom", {
        message: "PHONE_REQUIRED",
      });
    }

    return value;
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const firstMessage = error.details[0]?.context?.message || error.details[0].message;
    return next(new HTTP400Error(firstMessage)); // Already localized
  }

  req.body = value;
  next();
};

export const validateRegisterProfile = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  let locale = getLanguage(req);
  if (req.body.language) locale = req.body.language;
  const schema = Joi.object({
    name: Joi.string().trim().min(2).required().messages({
      "string.empty": "NAME_REQUIRED",
      "any.required": "NAME_REQUIRED",
    }),

    email: Joi.string().pattern(emailRegex).required().messages({
      "string.empty": "EMAIL_REQUIRED",
      "any.required": "EMAIL_REQUIRED",
      "string.pattern.base": "INVALID_EMAIL",
    }),

    phone: Joi.string().pattern(phoneRegex).required().messages({
      "string.empty": "PHONE_REQUIRED",
      "any.required": "PHONE_REQUIRED",
      "string.pattern.base": "INVALID_PHONE",
    }),

    countryCode: Joi.string().required().messages({
      "string.empty": "COUNTRY_CODE_REQUIRED",
      "any.required": "COUNTRY_CODE_REQUIRED",
    }),
    vehicleType: Joi.string().trim().required().messages({
      "string.empty": "VEHICLE_TYPE_REQUIRED",
      "any.required": "VEHICLE_TYPE_REQUIRED",
    })

  });

  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const msgArr = errorMessageHander(error.details);
    const err: any = new HTTP400Error(msgArr[0]);
    err.responseMessage = msgArr[0];
    return next(err);
  }

  req.body = value;
  next();
};

export const validateCompanyDocs = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const locale = getLanguage(req);
  const required = [
    "idFront",
    "idBack",
    "licenseFront",
    "licenseBack",
    "certification",
  ];

  const missing = required.filter((f) => !(req.files as any)?.[f]);
  if (missing.length) {
    return next(
      new HTTP400Error(
        `${"DOCUMENTS_REQUIRED"}: ${missing.join(", ")}`
      )
    );
  }
  next();
};


export const validateUpdateProfile = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  let locale = getLanguage(req);
  if (req.body.language) locale = req.body.language;

  const schema = Joi.object({
    name: Joi.string().trim().min(2).messages({
      "string.min": "NAME_REQUIRED",
    }),

    email: Joi.string().pattern(emailRegex).messages({
      "string.pattern.base": "INVALID_EMAIL",
    }),

    phone: Joi.string().pattern(phoneRegex).messages({
      "string.pattern.base": "INVALID_PHONE",
    }),

    licenceNo: Joi.string().trim(),

    vehicleType: Joi.string().trim(),

    language: Joi.string()
      .valid("en-US", "de-DE", "fr-FR", "pl-PL")
      .optional(),
  })
    .or("name", "email", "phone", "licenceNo", "vehicleType", "language")
    .messages({
      "object.missing": "NO_UPDATE_FIELDS", // add to i18n
    });

  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const msgArr = errorMessageHander(error.details);
    const err: any = new HTTP400Error(msgArr[0]);
    err.responseMessage = msgArr[0];
    return next(err);
  }

  req.body = value;
  next();
};




