import * as Joi from "joi";
import * as bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import {
  MutationAddUserInformationArgs,
  MutationLoginUserArgs,
  MutationRegisterArgs,
  QueryGetUserArgs,
  QueryGetUserInformationArgs,
} from "../generated/types";
import { User } from "../entity/User";
import { UserInformation } from "../entity/UserInformation";
import { GraphQLError } from "graphql";
import * as dotenv from "dotenv";
dotenv.config().parsed;

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
  // [x]: Get all users //
  async users() {
    return User.find({
      relations: {
        userInformation: true,
      },
    });
  }

  // [x]: Get specific user //
  async getUser({ email, _id }: QueryGetUserArgs) {
    const getUser = await User.findOne({
      relations: {
        userInformation: true,
      },
      where: [
        {
          email: email || "",
        },
        { _id: _id || "" },
      ],
    });

    if (!getUser) {
      return {
        code: 404,
        success: false,
        message: "No record/s found",
      };
    }

    return {
      code: 200,
      success: true,
      message: "User found",
      user: getUser,
    };
  }

  // [x]: Get user information of specific user //
  async getUserInformation({ _id }: QueryGetUserInformationArgs) {
    try {
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
        return {
          code: 404,
          success: false,
          message: "No record/s found",
        };
      }

      return {
        code: 200,
        success: true,
        message: "User information found",
        userInformation: userInfo,
      };
    } catch (error) {
      return {
        code: 400,
        success: false,
        message: error.message,
      };
    }
  }

  // [x]: Register a user
  async registerUser(args: MutationRegisterArgs) {
    try {
      await registerSchema.validateAsync(args, { abortEarly: false });
    } catch (err) {
      const { details } = err;
      return {
        code: 422,
        success: false,
        message: details[0].message,
      };
    }
    const { email, password, userRole } = args;

    try {
      const userFound = await User.findOne({
        relations: {
          userInformation: true,
        },
        where: {
          email: email,
        },
      });

      if (userFound) {
        throw new GraphQLError("User record already exists", {
          extensions: {
            code: "CONFLICT",
          },
        });
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
    } catch (error) {
      return {
        code: 400,
        success: false,
        message: error.message,
      };
    }
  }

  // [x]: Login a user; needs more security
  async loginUser(args: MutationLoginUserArgs) {
    try {
      await registerSchema.validateAsync(args, { abortEarly: false });
    } catch (err) {
      const { details } = err;
      return {
        code: 422,
        success: false,
        message: details[0].message,
      };
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
      return {
        code: 404,
        success: false,
        message: "User record not found",
      };
    }

    const passwordMatched = await bcrypt.compare(password, verifyUser.password);

    if (!passwordMatched) {
      return {
        code: 402,
        success: false,
        message:
          "Email/Password combination provided does not match our records",
      };
    }

    // const refreshToken = sign(
    //   { uid: verifyUser._id, userRole: verifyUser.userRole },
    //   process?.env?.JWT_REFRESH_SECRET || "",
    //   { expiresIn: "1d" }
    // );

    const accessToken = sign(
      { _id: verifyUser._id },
      process.env.JWT_ACCESS_SECRET || "",
      { expiresIn: 15 * 60 }
    );

    return {
      code: 200,
      success: true,
      message: "Login successfully",
      user: verifyUser,
      token: `Bearer ${accessToken}`,
    };
  }

  // [x]: Add user information; needs
  async addUserInformation({ input }: MutationAddUserInformationArgs) {
    try {
      await userInformationSchema.validateAsync(input, { abortEarly: false });
    } catch (err) {
      const { details } = err;
      return {
        code: 422,
        success: false,
        message: details[0].message,
      };
    }

    try {
      const verifyUser = await User.findOne({
        where: {
          _id: input?._id,
        },
      });

      if (!verifyUser) {
        return {
          code: 404,
          success: false,
          message: "User record not found",
        };
      }

      const createUserInformation = UserInformation.create({
        user: verifyUser,
        firstName: input?.firstName,
        lastName: input?.lastName,
        middleName: input?.middleName,
        contactNumber: input?.contactNumber,
        specialization: input?.specialization || "NONE",
        schedule: input?.schedule || "NONE",
        updatedAt: new Date().toISOString(),
      });

      const res = await createUserInformation.save();
      verifyUser.updatedAt = new Date().toISOString();
      await verifyUser.save();

      return {
        code: 200,
        success: true,
        message: "User information updated",
        userInformation: res,
      };
    } catch (err) {
      const { details } = err;
      return {
        code: 400,
        success: false,
        message: details[0].message,
      };
    }
  }
}

export default new UserService();
