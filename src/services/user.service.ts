import * as Joi from "joi";
import * as bcrypt from "bcrypt";
import {
  MutationAddUserInformationArgs,
  MutationDeleteAccountArgs,
  MutationLoginUserArgs,
  MutationRegisterArgs,
  MutationRemoveUserArgs,
  MutationVerifyEmailArgs,
  QueryGetUserArgs,
  QueryGetUserInformationArgs,
} from "../generated/types";
import { User } from "../entity/User";
import { UserInformation } from "../entity/UserInformation";
import throwCustomError, { ErrorTypes } from "../helpers/error-handler.helper";
import { authUtilities } from "../helpers/auth.helper";

const registerSchema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
  password: Joi.string().pattern(new RegExp("")),
  userRole: Joi.string().valid("PERSONNEL", "DOCTOR"),
});

const userInformationSchema = Joi.object({
  _id: Joi.string().uuid(),
  firstName: Joi.string().pattern(new RegExp("[a-zA-z ]{3,}")),
  lastName: Joi.string().pattern(new RegExp("[a-zA-Z ]{3,}")),
  middleName: Joi.string().pattern(new RegExp("[a-zA-Z ]{3,}")),
  contactNumber: Joi.string().pattern(new RegExp("[0-9]")),
  specialization: Joi.string()
    .valid("GENERAL_PRACTITIONER", "INTERNAL_MEDICINE")
    .insensitive(),
  schedule: Joi.string(),
});

class UserService {
  async users() {
    return User.find({
      relations: {
        userInformation: true,
      },
    });
  }

  async getUser({ email, _id }: QueryGetUserArgs) {
    const getUser = await User.findOne({
      relations: {
        userInformation: true,
      },
      where: [{ _id: _id || "" }, { email: email || "" }],
    });

    if (!getUser) {
      return throwCustomError(
        "No user records match the input criteria",
        ErrorTypes.NOT_FOUND
      );
    }

    return {
      code: 200,
      success: true,
      message: "User located",
      user: getUser,
    };
  }

  async getUserInformation({ _id }: QueryGetUserInformationArgs) {
    const userInfo = await UserInformation.findOne({
      relations: {
        user: true,
      },
      where: {
        user: {
          _id: _id,
        },
      },
    });

    if (!userInfo) {
      return throwCustomError(
        "User information does not exist in the input criteria",
        ErrorTypes.NOT_FOUND
      );
    }

    return {
      code: 200,
      success: true,
      message: "User information located",
      userInformation: userInfo,
    };
  }

  async registerUser(args: MutationRegisterArgs) {
    try {
      await registerSchema.validateAsync(args, { abortEarly: false });
    } catch (error) {
      return throwCustomError(error, ErrorTypes.BAD_USER_INPUT);
    }
    const { email, password, userRole } = args;

    const userFound = await User.findOne({
      relations: {
        userInformation: true,
      },
      where: {
        email: email || "",
      },
    });

    if (userFound) {
      return throwCustomError(
        "User record already exists",
        ErrorTypes.CONFLICT
      );
    }

    const registerUser = User.create({
      userRole: userRole || "PERSONNEL",
      email,
      password,
    });

    const res = await registerUser.save();
    return {
      code: 200,
      success: true,
      message: "Successfully registered",
      user: res,
    };
  }

  async loginUser(args: MutationLoginUserArgs) {
    try {
      await registerSchema.validateAsync(args, { abortEarly: false });
    } catch (error) {
      return throwCustomError(error, ErrorTypes.BAD_USER_INPUT);
    }
    const { email, password } = args;

    const verifyUser = await User.findOne({
      relations: {
        userInformation: true,
      },
      where: {
        email: email,
      },
    });

    if (!verifyUser) {
      return throwCustomError(
        "No user records match the input criteria",
        ErrorTypes.NOT_FOUND
      );
    }

    const passwordMatched = await bcrypt.compare(password, verifyUser.password);

    if (!passwordMatched) {
      return throwCustomError(
        "Email/Password combination provided does not match our records.",
        ErrorTypes.UNAUTHORIZED
      );
    }

    const refreshToken = authUtilities.signToken(
      {
        "_id": verifyUser._id,
        "userRole": verifyUser.userRole,
      },
      {
        expiresIn: "7d",
      }
    );

    const accessToken = authUtilities.signToken(
      {
        "_id": verifyUser._id,
        "userRole": verifyUser.userRole,
        "UserInformation": {
          "firstname": verifyUser.userInformation.firstName,
          "lastname": verifyUser.userInformation.lastName,
          "middleName": verifyUser.userInformation.middleName,
          "specialization": verifyUser.userInformation.specialization,
        },
      },
      { expiresIn: "15m" }
    );

    return {
      code: 200,
      success: true,
      message: "Login successful.",
      user: verifyUser,
      refreshToken: refreshToken,
      accessToken: accessToken,
    };
  }

  async addUserInformation({ input }: MutationAddUserInformationArgs) {
    try {
      await userInformationSchema.validateAsync(input, { abortEarly: false });
    } catch (error) {
      return throwCustomError(error, ErrorTypes.BAD_USER_INPUT);
    }

    const verifyUser = await User.findOne({
      relations: {
        userInformation: true,
      },
      where: {
        _id: input?._id,
      },
    });

    if (!verifyUser) {
      return throwCustomError(
        "No user records match the input criteria",
        ErrorTypes.CONFLICT
      );
    }

    const res = await UserInformation.save({
      _id: verifyUser._id,
      user: verifyUser,
      firstName: input?.firstName,
      lastName: input?.lastName,
      middleName: input?.middleName,
      contactNumber: input?.contactNumber,
      specialization: input?.specialization || undefined,
      schedule: input?.schedule || undefined,
      updatedAt: new Date().toISOString(),
    });

    return {
      code: 200,
      success: true,
      message: "User information updated",
      userInformation: res,
    };
  }

  async removeUser({ id }: MutationRemoveUserArgs) {
    const getUser = await User.findOne({
      relations: {
        userInformation: true,
      },
      where: {
        _id: id,
      },
    });

    if (!getUser) {
      return throwCustomError(
        "No user records match the input criteria",
        ErrorTypes.NOT_FOUND
      );
    }

    const removeUser = await User.remove(getUser);

    if (!removeUser) {
      return throwCustomError(
        "Something went wrong with the process",
        ErrorTypes.BAD_REQUEST
      );
    }

    return {
      code: 200,
      success: true,
      message: "User has been removed",
    };
  }

  async deleteAccount({ id, password }: MutationDeleteAccountArgs) {
    const getUser = await User.findOne({
      relations: {
        userInformation: true,
      },
      where: {
        _id: id,
      },
    });

    if (!getUser) {
      return throwCustomError(
        "No user records match the input criteria",
        ErrorTypes.NOT_FOUND
      );
    }

    const passwordMatched = await bcrypt.compare(password, getUser.password);

    if (!passwordMatched) {
      return throwCustomError(
        "Your password does not match.",
        ErrorTypes.UNAUTHORIZED
      );
    }

    const deleteAccount = await User.remove(getUser);

    if (!deleteAccount) {
      return throwCustomError(
        "Something went wrong with the process",
        ErrorTypes.BAD_REQUEST
      );
    }

    return {
      code: 200,
      success: true,
      message: "Your account has been deleted",
    };
  }

  async verifyEmail({ id }: MutationVerifyEmailArgs) {
    const verifyUser = await User.findOne({
      relations: {
        userInformation: true,
      },
      where: {
        _id: id,
      },
    });

    if (!verifyUser) {
      return throwCustomError(
        "No user records match the input criteria",
        ErrorTypes.NOT_FOUND
      );
    }

    await User.update({ _id: verifyUser._id }, { emailVerified: true });

    const userResponse = await User.findOne({
      relations: {
        userInformation: true,
      },
      where: {
        _id: verifyUser._id,
      },
    });

    if (!userResponse) {
      return throwCustomError(
        "No user records match the input criteria",
        ErrorTypes.NOT_FOUND
      );
    }

    return {
      code: 200,
      success: true,
      message: "Email verified",
      user: userResponse,
    };
  }
}

export default new UserService();
