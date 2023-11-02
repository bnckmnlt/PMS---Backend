import { verify } from "jsonwebtoken";
import { User } from "../entity/User";

export const AuthMiddleware = async ({ req, next }: any) => {
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
    decodedToken = verify(token, `${process.env.JWT_REFRESH_SECRET}`);
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
