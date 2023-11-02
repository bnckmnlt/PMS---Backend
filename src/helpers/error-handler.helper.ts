import { ApolloServerErrorCode } from "@apollo/server/errors";
import { GraphQLError } from "graphql";

export const ErrorTypes = {
  BAD_USER_INPUT: {
    errorCode: ApolloServerErrorCode.BAD_USER_INPUT,
    errorStatus: 422,
  },
  BAD_REQUEST: {
    errorCode: ApolloServerErrorCode.BAD_REQUEST,
    errorStatus: 400,
  },
  UNAUTHORIZED: {
    errorCode: "UNAUTHORIZED",
    errorStatus: 401,
  },
  FORBIDDEN: {
    errorCode: "FORBIDDEN",
    errorStatus: 403,
  },
  NOT_FOUND: {
    errorCode: "NOT_FOUND",
    errorStatus: 404,
  },
  CONFLICT: {
    errorCode: "CONFLICT",
    errorStatus: 409,
  },
  INTERNAL_SERVER_ERROR: {
    errorCode: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
    errorStatus: 409,
  },
};

export default (errorMessage: string, errorType: any) => {
  throw new GraphQLError(errorMessage, {
    extensions: {
      code: errorType.errorCode,
      http: {
        status: errorType.errorStatus,
      },
    },
  });
};
