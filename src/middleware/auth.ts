import { verify } from "jsonwebtoken";
import { User } from "../entity/User";

// type DecodedToken = {
//   _id: string,
//   iat: number,
//   exp: number
// }

export const AuthMiddleware = async (req: any, _: any, next: any) => {
  const authHeaders = req.get("Authorization");

  if (!authHeaders) {
    req.isAuth = false;
    return next();
  }

  let token = authHeaders.split(" ")[1];
  if (!token || token === "") {
    req.isAuth = false;
    return next();
  }

  let decodedToken: any;

  try {
    decodedToken = verify(
      token,
      "d389ec342f2920ab834f9f28cfaa52d4d9b69d9634a75f6a57771825ac5c527d65a2b6fe83f5b7058cb6ec7bfc02b5861b099dc24c8e9a2cb52388ab00a90357"
    );
  } catch (error) {
    req.isAuth = false;
    return next();
  }

  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }

  const verifyUser = await User.findOne({
    where: {
      _id: decodedToken._id || "",
    },
  });

  if (!verifyUser) {
    req.isAuth = false;
    return next();
  }

  req.user = verifyUser;
  req.isAuth = true;
  return next();
};
