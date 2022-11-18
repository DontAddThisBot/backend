import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import request from "request";
import cors from "cors";
import { backend, token } from "../config.json";
import parser from "cookie-parser";
import jwt from "jsonwebtoken";
import { middleWare } from "./middleware/middleware";

import join from "./routes/join";
import part from "./routes/part";
import createUser from "./routes/createUser";

const app = express();

declare module "express-session" {
  export interface SessionData {
    user: { [key: string]: any };
  }
}

const TWITCH_CLIENT_ID = backend.client_id;
const TWITCH_SECRET = backend.client_secret;
const SESSION_SECRET = backend.session_secret;
const CALLBACK_URL = backend.callback_url;

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
    },
  }),
  passport.session(),
  passport.initialize(),
  cors({
    origin: backend.origin,
    credentials: true,
  }),
  express.json(),
  express.urlencoded({ extended: true }),
  parser(),
  [join, part, createUser]
);

OAuth2Strategy.prototype.userProfile = function (accessToken: string, done) {
  const options = {
    url: "https://api.twitch.tv/helix/users",
    method: "GET",
    headers: {
      "Client-ID": TWITCH_CLIENT_ID,
      Accept: "application/vnd.twitchtv.v5+json",
      Authorization: "Bearer " + accessToken,
    },
  };

  request(
    options,
    function (error: any, response: { statusCode: number }, body: string) {
      if (response && response.statusCode == 200) {
        done(null, JSON.parse(body));
      } else {
        done(JSON.parse(body));
      }
    }
  );
};

passport.serializeUser(function (
  user: any,
  done: (arg0: any, arg1: any) => void
) {
  done(null, user);
});

passport.deserializeUser(function (
  user: any,
  done: (arg0: any, arg1: any) => void
) {
  done(null, user);
});

passport.use(
  "twitch",
  new OAuth2Strategy(
    {
      authorizationURL: "https://id.twitch.tv/oauth2/authorize",
      tokenURL: "https://id.twitch.tv/oauth2/token",
      clientID: TWITCH_CLIENT_ID,
      clientSecret: TWITCH_SECRET,
      callbackURL: CALLBACK_URL,
      state: true,
    },
    function (
      accessToken: any,
      refreshToken: any,
      profile: { accessToken: any; refreshToken: any },
      done: (arg0: any, arg1: any) => void
    ) {
      profile.accessToken = accessToken;
      profile.refreshToken = refreshToken;
      done(null, profile);
    }
  )
);

app.get("/auth/twitch", passport.authenticate("twitch", { scope: "" }));

app.get(
  "/auth/twitch/callback",
  passport.authenticate("twitch"),
  (req: any, res: any, next) => {
    if (req.session && req.session.passport && req.session.passport.user) {
      const info = req.session.passport.user;
      const signToken = jwt.sign(info, token.key);
      res.clearCookie("connect.sid");
      res.cookie("token", signToken, {
        httpOnly: true,
      });

      res.redirect(backend.origin);
    }
  }
);

app.get("/api/twitch", middleWare, (req: any, res: any) => {
  console.log(req.user);
  return res.status(200).send({ success: true, id: req.user });
});

app.get("/api/twitch/logout", (req: any, res: any) => {
  res.clearCookie("token");
  res.redirect(backend.origin);
});

app.listen(backend.port, () => {
  console.log(`Server listening on port ${backend.port}`);
});
