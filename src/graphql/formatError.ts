import { ApolloServerErrorCode } from "@apollo/server/errors";

export const formatError = (formattedError: any, error: any) => {
  if (error.extensions.code === ApolloServerErrorCode.BAD_USER_INPUT) {
    return {
      ...formattedError,
      message: "Invalid input provided. Please review and correct your input.",
    };
  }

  if (error.extensions.code === "CONFLICT") {
    return {
      ...formattedError,
      message:
        "User with provided information already exists. Please use different credentials.",
    };
  }

  return formattedError;
};
