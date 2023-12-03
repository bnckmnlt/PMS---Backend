import * as Joi from "joi";
import * as bcrypt from "bcrypt";
import {
  MutationAddUserInformationArgs,
  MutationDeleteAccountArgs,
  MutationLoginRfidArgs,
  MutationLoginUserArgs,
  MutationRegisterArgs,
  MutationRemoveUserArgs,
  MutationUpdateUserInformationArgs,
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
  image: Joi.string().optional(),
  cardId: Joi.string().optional(),
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
  //[x] All users; done
  async users() {
    return User.find({
      relations: {
        userInformation: true,
        notifications: true,
      },
    });
  }

  //[x] Get user; Done
  async getUser({ email, _id }: QueryGetUserArgs) {
    const getUser = await User.findOne({
      relations: {
        userInformation: true,
        notifications: true,
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

  //[x] Get user information; done
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

  // [x] Register User; Done
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

  // [x] Login User; Done
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

    if (!verifyUser.userInformation) {
      return throwCustomError(
        "Please verify your account to proceed",
        ErrorTypes.FORBIDDEN
      );
    }

    const {
      userInformation: { _id, user, ...userInformation },
    } = verifyUser;

    const passwordMatched = await bcrypt.compare(password, verifyUser.password);

    if (!passwordMatched) {
      return throwCustomError(
        "Email/Password combination provided does not match our records.",
        ErrorTypes.UNAUTHORIZED
      );
    }

    const refreshToken = authUtilities.signToken(
      {
        "_id": _id,
        "userRole": verifyUser.userRole,
      },
      {
        expiresIn: "7d",
      }
    );

    const accessToken = authUtilities.signToken(
      {
        "_id": _id,
        "userRole": verifyUser.userRole,
        userInformation,
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

  //[x] Login using Rfid; done
  async loginRfid({ cardId }: MutationLoginRfidArgs) {
    const getUser = await User.findOne({
      relations: {
        userInformation: true,
      },
      where: {
        userInformation: {
          cardId: cardId,
        },
      },
    });

    if (!getUser) {
      return throwCustomError(
        "No user record matches the input criteria",
        ErrorTypes.NOT_FOUND
      );
    }

    if (!getUser.userInformation) {
      return throwCustomError(
        "Please verify your account to proceed",
        ErrorTypes.FORBIDDEN
      );
    }

    const { _id, ...userInformation } = getUser;

    const refreshToken = authUtilities.signToken(
      {
        "_id": getUser._id,
        "userRole": getUser.userRole,
      },
      { expiresIn: "7d" }
    );

    const accessToken = authUtilities.signToken(
      {
        "_id": getUser._id,
        "userInformation": userInformation,
      },
      { expiresIn: "15m" }
    );

    return {
      code: 200,
      success: true,
      message: "Successfully logged in",
      user: getUser,
      refreshToken,
      accessToken,
    };
  }

  // [x] Add UserInformation; Done
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

    const { userInformation } = verifyUser;

    if (userInformation) {
      return throwCustomError(
        "An existing record already exists",
        ErrorTypes.CONFLICT
      );
    }

    const res = await UserInformation.save({
      user: verifyUser,
      image: input?.image || undefined,
      cardId: input?.cardId || undefined,
      firstName: input?.firstName,
      lastName: input?.lastName,
      middleName: input?.middleName,
      contactNumber: input?.contactNumber,
      specialization: input?.specialization || undefined,
      schedule: input?.schedule || undefined,
    });

    return {
      code: 200,
      success: true,
      message: "User information updated",
      userInformation: res,
    };
  }

  // [x] Update UserInformation; Done
  async updateUserInformation({ input }: MutationUpdateUserInformationArgs) {
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

    const { userInformation } = verifyUser;

    if (!userInformation) {
      return throwCustomError(
        "No user records match the input criteria",
        ErrorTypes.CONFLICT
      );
    }

    await UserInformation.update(
      { _id: verifyUser.userInformation._id },
      {
        image: input?.image || undefined,
        cardId: input?.cardId || undefined,
        firstName: input?.firstName || undefined,
        lastName: input?.lastName || undefined,
        middleName: input?.middleName || undefined,
        contactNumber: input?.contactNumber || undefined,
        specialization: input?.specialization || undefined,
        schedule: input?.schedule || undefined,
      }
    );

    return {
      code: 200,
      success: true,
      userInformation,
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
