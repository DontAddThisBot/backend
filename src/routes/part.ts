import express from "express";
const router = express.Router();
import { partChannelByUsername } from "../rpc/dontaddthisbot";
import { middleWare } from "../middleware/middleware";

router.post(`/api/bot/part`, middleWare, async (req: any, res: any) => {
  const { login } = req.user;

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
