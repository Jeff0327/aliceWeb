const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel.js");
const expressAsyncHandler = require("express-async-handler");
const userRouter = express.Router();
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");
const {
  isAuth,
  isAdmin,
  generateToken,
  baseUrl,
  mailgun,
} = require("../utils.js");

userRouter.get(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.send(users);
  })
);
userRouter.get(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      res.send(user);
    } else {
      res
        .status(404)
        .send({ message: "유저를 찾을 수 없습니다. [error code:010]" });
    }
  })
);

userRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.email === process.env.ADMIN_ID) {
        res.status(400).send({ message: "관리자 계정은 삭제할 수 없습니다." });
        return;
      }
      await user.deleteOne();
      res.send({ message: "유저가 삭제되었습니다." });
    } else {
      res
        .status(404)
        .send({ message: "유저를 찾을 수 없습니다. [error code:011]" });
    }
  })
);

userRouter.post(
  "/forget-password",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "3h",
      });
      user.resetToken = token;
      await user.save();

      console.log(`${baseUrl()}/reset-password/${token}`);

      mailgun()
        .messages()
        .send(
          {
            from: "RoseMarry <cocacola158500@gmail.com>",
            to: `${user.name} <${user.email}>`,
            subject: "비밀번호 변경",
            html: `
        <p>비밀번호를 변경하려면 여기를 클릭하세요:</p>
        <a href="${baseUrl()}/reset-password/${token}"}>비밀번호 변경</a>
        `,
          },
          (error, body) => {
            console.log(error);
            console.log(body);
          }
        );
      res.send({ message: "패스워드 변경 링크를 이메일로 보냈습니다." });
    } else {
      res
        .status(404)
        .send({ message: "이메일을 찾을 수 없습니다. [error code:012]" });
    }
  })
);

userRouter.post(
  "/reset-password",
  expressAsyncHandler(async (req, res) => {
    jwt.verify(req.body.token, process.env.JWT_SECRET, async (err, decode) => {
      if (err) {
        res
          .status(401)
          .send({ message: "인증이 만료되었습니다. [error code:020]" });
      } else {
        const user = await User.findOne({ resetToken: req.body.token });
        if (user) {
          if (req.body.password) {
            user.password = bcrypt.hashSync(req.body.password, 8);
            await user.save();
            res.send({
              message: "패스워드가 초기화 되었습니다.",
            });
          }
        } else {
          res
            .status(404)
            .send({ message: "유저를 찾을 수 없습니다. [error code:013]" });
        }
      }
    });
  })
);

userRouter.get(
  "/googlelogin",
  expressAsyncHandler(async (req, res) => {
    try {
      const oAuth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET_PASSWORD,
        "postmessage"
      );
      const { tokens } = await oAuth2Client.getToken(req.body.res); // exchange code for tokens
      console.log(tokens);

      res.json(tokens);
    } catch (err) {
      console.log(err);
    }
  })
);

// Naver Callback Route
// userRouter.get(
//   "/naverlogin",
//   expressAsyncHandler(async (req, res) => {
//     try {
//       const REDIRECT_URI = req.query.REDIRECT_URI || ""; // Use req.query to get the REDIRECT_URI
//       const state = "false";

//       const url = await axios.get(
//         `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${process.env.NAVER_CLIENT_ID}&state=${state}&redirect_uri=${REDIRECT_URI}`
//       );

//       res.send({ naverUrl: url.data }); // Send the Naver URL in the response
//     } catch (error) {
//       console.error("Error in /naverlogin:", error);
//       res.status(500).send({ message: "Internal Server Error!!", error });
//     }
//   })
// );

userRouter.get("/naver/callback", async (req, res) => {
  try {
    const { code, state } = req.query;

    const stateBuffer = Buffer.from(state).toString("base64");
    // if (!code || code === "undefined" || code === null) {
    //   res.status(400).send({ message: "Code is missing or invalid" });
    //   return;
    // }
    const naverToken = await axios.get(
      `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${process.env.NAVER_CLIENT_ID}&client_secret=${process.env.NAVER_CLIENT_SECRET}&code=${code}&state=${stateBuffer}`
    );
    if (naverToken) {
      res.send({ naverToken: naverToken });
    }
    // const accessToken = naverTokenResponse.data.access_token;
    // if (!accessToken) {
    //   res.status(401).send({ message: "Access token is 401 error" });
    // } else {
    //   console.log(accessToken);
    // }

    // const naverUserInfoResponse = await axios.get(
    //   "https://openapi.naver.com/v1/nid/me",
    //   {
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //     },
    //   }
    // );

    // const naverUserInfo = naverUserInfoResponse.data.response;

    // // Check if the user already exists in your database
    // let user = await User.findOne({ email: naverUserInfo.email });

    // if (!user) {
    //   // If the user doesn't exist, create a new user in your database
    //   user = new User({
    //     name: naverUserInfo.name,
    //     email: naverUserInfo.email,
    //     // Add other necessary fields based on your User model
    //   });

    //   await user.save();
    // }

    // // Generate a token and send it in the response
    // res.send({
    //   _id: user._id,
    //   name: user.name,
    //   email: user.email,
    //   isAdmin: user.isAdmin,
    //   token: generateToken(user),
    // });
    // res.send({
    //   NAVERCLIENT_ID: process.env.NAVER_CLIENT_ID,
    //   NAVER_CLIENT_SECRET: process.env.NAVER_CLIENT_SECRET,
    //   code: code,
    //   state: state,
    //   stateBuffer: stateBuffer,
    // });
  } catch (error) {
    console.error("Error in /naver/callback:", error);

    res.status(500).send({ message: "Internal Server Error!!", error });
  }
});
userRouter.post(
  "/signin",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: "이메일 또는 비밀번호가 틀립니다." });
  })
);

userRouter.post(
  "/signup",
  expressAsyncHandler(async (req, res) => {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    const user = await newUser.save();
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    });
  })
);
userRouter.put(
  "/profile",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }

      const updatedUser = await user.save();
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser),
      });
    } else {
      res
        .status(404)
        .send({ message: "유저를 찾을 수 없습니다.[error code:014]" });
    }
  })
);
userRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = Boolean(req.body.isAdmin);
      const updatedUser = await user.save();
      res.send({ message: "유저가 업데이트되었습니다.", user: updatedUser });
    } else {
      res
        .status(404)
        .send({ message: "유저를 찾을 수 없습니다. [error code:015]" });
    }
  })
);
module.exports = userRouter;
