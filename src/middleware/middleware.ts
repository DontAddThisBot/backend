import { token } from "../../config.json";
import jwt from "jsonwebtoken";

export function middleWare(req: any, res: any, next: any) {
  const cookieToken = req.cookies.token;
  if (!cookieToken) {
    return res.status(401).send({ success: false, message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(cookieToken, token.key);
    req.user = decoded;
    next();
  } catch (e) {
    res.clearCookie("token");
    console.log(e);
    return res.status(401).send({ success: false, message: "Unauthorized" });
  }
}
