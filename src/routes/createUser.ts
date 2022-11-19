import express from "express";
const router = express.Router();
import { createUser } from "../rpc/dontaddthisbot";
import { middleWare } from "../middleware/middleware";

router.post(`/api/bot/create`, middleWare, async (req: any, res: any) => {
  const { id, login } = req.user;

  const r = await createUser(id, login);
  if (!r.success) {
    return res.json({
      success: false,
      message: r.message,
    });
  }

  return res.json({ success: true });
});

export default router;
