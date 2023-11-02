import { sign, verify, JsonWebTokenError } from "jsonwebtoken";

export const authUtilities = {
  signToken: (data: object, duration: object) => {
    return sign({ data }, `${process.env.JWT_REFRESH_SECRET}`, duration);
  },
  authMiddleware: async ({ req }: any) => {
    try {
      const token =
        req.body.token || req.query.token || req.headers.authorization;

      if (!token) {
        return req;
      }

      const [type, tokenValue] = token.split(" ");

      if (type !== "Bearer" || !tokenValue) {
        throw new Error("Invalid token format");
      }

      const decodedToken: any = verify(
        tokenValue,
        `${process.env.JWT_REFRESH_SECRET}`
      );

      req.user = decodedToken.data;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        console.log(`JWT Error: ${error.message}`);
      } else {
        console.error(`An unexpected error has occurred: ${error}`);
      }
    }

    return req;
  },
};
