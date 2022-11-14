import express from "express";
const router = express.Router();
import { partChannelByUsername } from "../rpc/dontaddthisbot";

router.post(`/api/bot/part`, async (req: any, res: any) => {
  if (!req.session || !req.session.passport || !req.session.passport.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const { login } = req.session.passport.user.data[0];

  const r = await partChannelByUsername(login);
  if (!r.success) {
    return res.json({
      success: false,
      message: r.message,
    });
  }

  return res.json({ success: true });
});

export default router;
