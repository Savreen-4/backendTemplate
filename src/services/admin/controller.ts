import { userModel } from "../../db/User";
import { Utilities } from "../../utils/AuthUtilities";
import { ADMIN_ROLE } from "../../utils/const";
import { handleServerError } from "../../utils/ErrorHandler";
import { getLanguage } from "../../utils/getLanguage";
import { HTTP404Error } from "../../utils/httpErrors";
import { INVALID_LOGIN, USER_NOT_EXIST } from "../../utils/messages";
import * as bcrypt from "bcrypt";

export const createAdmin = async (req: any, res: any) => {
  try {
    let locale = getLanguage(req);
    let pass = await Utilities.cryptPassword("Qwerty@1");
    let userRes: any = await userModel.findOne({ email: "admin@gmail.com", isDeleted: false });
    if (!userRes) {
      let adminArr = [
        {
          fullName: "Admin",
          email: "admin@gmail.com",
          password: pass,
          isDeleted: false,
          role: ADMIN_ROLE,
        },
        {
          fullName: "Admin",
          email: "testadmin@gmail.com",
          password: pass,
          isDeleted: false,
          role: ADMIN_ROLE,
        },
      ];
      let res = await userModel.create(adminArr);
      return Utilities.sendResponsData({
        data: res,
        message: "ADMIN_CREATED",
      });
    } else {
      userRes.role = 'admin';
      let res = await userRes.save();
      return Utilities.sendResponsData({
        data: res,
        message: "ADMIN_CREATED",
      });
    }

  } catch (error: any) {
    console.log('error==', error);
    handleServerError(error, res);
  }
};

export const adminLogin = async (req: any, body: any, res: any, next: any) => {
  try {
    let locale = getLanguage(req);
    const { email, password } = body;
    const admin = await userModel.findOne({
      email: email,
      isDeleted: false,
      role: { $eq: "Admin" },
    });
    if (!admin) {
      return next(new HTTP404Error(USER_NOT_EXIST));
    }
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return next(new HTTP404Error(INVALID_LOGIN));
    }
    let userToken = await Utilities.createJWTToken({
      userId: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    });
    admin.accessToken = userToken;
    await admin.save(admin);

    admin.token = userToken;

    const userData = { ...admin };
    const result = userData?._doc;
    delete result.password;

    return Utilities.sendResponsData({
      message: "SUCCESS",
      data: result,
    });
  } catch (error) {
    const err = error as Error;
    handleServerError(err, res);
  }
};
