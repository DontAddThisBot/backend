import express from "express";
const router = express.Router();
import { joinChannelByUsername } from "../rpc/dontaddthisbot";
import { middleWare } from "../middleware/middleware";

router.post(`/api/bot/join`, middleWare, async (req: any, res: any) => {
  const { login } = req.user.data[0];

  const r = await joinChannelByUsername(login);
  if (!r.success) {
    return res.json({
      success: false,
      message: r.message,
    });
  }

  return res.json({ success: true });
});

export default router;
