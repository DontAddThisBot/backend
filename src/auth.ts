import express from "express";
import cors from "cors";
import { backend, token } from "../config.json";
import parser from "cookie-parser";
import jwt from "jsonwebtoken";
import { middleWare } from "./middleware/middleware";
import fetch from "node-fetch";
import { getTwitchProfile } from "./token/getTwitchProfile";

import join from "./routes/join";
import part from "./routes/part";
import createUser from "./routes/createUser";

const app = express();

const TWITCH_CLIENT_ID = backend.client_id;
const TWITCH_SECRET = backend.client_secret;
const CALLBACK_URL = backend.callback_url;

app.use(
  cors({ origin: true, credentials: true }),
  express.json(),
  express.urlencoded({ extended: true }),
  parser(),
  [join, part, createUser]
);

app.post("/redirect", async (req: any, res: any) => {
  console.log("got request", req.body);
  const { path } = req.body;
  res.cookie("current", path, {
    httpOnly: true,
  });

  console.log("success");
  res.status(200).send({ success: true });
});

app.get("/auth/twitch/callback", async (req: any, res: any, next) => {
  console.log(req.cookies);
  const { current } = req.cookies;
  if (req.cookies?.token) {
    return res.redirect(backend.origin + current);
  }

  const { code, state } = req.query;

  const searchParams = new URLSearchParams({
    client_id: TWITCH_CLIENT_ID,
    client_secret: TWITCH_SECRET,
    code,
    grant_type: "authorization_code",
    redirect_uri: CALLBACK_URL,
    state,
  });

  const { access_token, refresh_token } = await fetch(
    "https://id.twitch.tv/oauth2/token?" + searchParams.toString(),
    {
      method: "POST",
    }
  ).then((res) => res.json());

  const profile = await getTwitchProfile(access_token, TWITCH_CLIENT_ID);
  if (!profile) {
    return res.redirect(backend.origin + current);
  }

  const info = {
    id: profile[0].id,
    login: profile[0].login,
  };

  const signJWT = jwt.sign(info, token.key);
  res.cookie("token", signJWT, {
    httpOnly: true,
    secure: true,
  });

  return res.redirect(backend.origin + current);
});

app.get("/api/twitch", middleWare, async (req: any, res: any) => {
  try {
    const userInfo = await getTwitchProfile(
      token.access_token,
      token.client_id,
      req.user.id
    );
    return res.status(200).send({ success: true, id: { data: userInfo } });
  } catch (err) {
    return res.status(500).send({ success: false, message: err });
  }
});

app.post("/api/twitch/logout", middleWare, (req: any, res: any) => {
  res.clearCookie("connect.sid");
  res.clearCookie("token");
  res.clearCookie("current");
  return res.status(200).send({ success: true });
});

app.listen(backend.port, () => {
  console.log(`Server listening on port ${backend.port}`);
});
