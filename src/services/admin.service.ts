import * as bcrypt from "bcrypt";
import { authUtilities } from "../helpers/auth.helper";
import { Admin } from "../entity/Admin";
import {
  MutationAddAdminArgs,
  MutationLoginAdminArgs,
} from "../generated/types";
import throwCustomError, { ErrorTypes } from "../helpers/error-handler.helper";

class AdminService {
  async addAdmin({ username, password, cardId }: MutationAddAdminArgs) {
    try {
      const checkAdmin = await Admin.findOne({
        where: {
          username: username,
        },
      });

      if (checkAdmin) {
        return throwCustomError(
          "Admin record already exists",
          ErrorTypes.CONFLICT
        );
      }

      const registerAdminAccount = Admin.create({
        username,
        password,
        cardId: cardId || "",
      });

      const response = await registerAdminAccount.save();

      return {
        code: 200,
        success: true,
        message: "Admin account added",
        credentials: response,
      };
    } catch (error) {
      return throwCustomError(error, ErrorTypes.BAD_REQUEST);
    }
  }

  async loginAdmin({ username, password, cardId }: MutationLoginAdminArgs) {
    const verifyAdmin = await Admin.findOne({
      where: [
        {
          username: username,
        },
        {
          cardId: cardId || "",
        },
      ],
    });

    if (!verifyAdmin) {
      return throwCustomError(
        "No admin records match the input criteria",
        ErrorTypes.NOT_FOUND
      );
    }

    const passwordMatched = await bcrypt.compare(
      password,
      verifyAdmin.password
    );

    if (!passwordMatched) {
      return throwCustomError(
        "Username/Password combination provided does not match our records.",
        ErrorTypes.UNAUTHORIZED
      );
    }

    const refreshToken = authUtilities.signToken(
      {
        "_id": verifyAdmin._id,
        "userRole": verifyAdmin.role,
        "cardId": verifyAdmin.cardId,
      },
      {
        expiresIn: "7d",
      }
    );

    return {
      code: 200,
      success: true,
      message: "Login success",
      credentials: verifyAdmin,
      refreshToken,
    };
  }
}

export default new AdminService();
