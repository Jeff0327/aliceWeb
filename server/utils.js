const jwt = require("jsonwebtoken");
const mg = require("mailgun-js");
const { kakaoUser, SocialUser } = require("./models/userModel");
const baseUrl = () =>
  process.env.BASE_URL
    ? process.env.BASE_URL
    : process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://rosemarry.kr";

const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (authorization) {
    const token = authorization.slice(7, authorization.length);
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({
          message: "인증이 만료되었습니다. [error code:021]",
          err,
          decode,
        });
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res
      .status(401)
      .send({ message: "인증이 만료되었습니다.[error code:022]", err });
    //토큰없음
  }
};
const isSocialAuth = async (req, res, next) => {
  const authorization = req.headers.authorization;
  const token = authorization.slice(7, authorization.length);
  const kakaoUser = await SocialUser.findOne({ kakaoToken: token });
  if (authorization) {
    res.send({ kakaoUser });
    next();
  } else {
    res
      .status(401)
      .send({ message: "인증이 만료되었습니다.[error code:022]", err });
    //토큰없음
  }
};
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res
      .status(401)
      .send({ message: "관리자 인증이 만료되었습니다. [error code:001]" });
  }
};
const mailgun = () =>
  mg({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  });

const payOrderEmailTemplate = (order) => {
  return `<h1>구매해주셔서 감사합니다.</h1>
  <p>안녕하세요 ${order.user.name}님,</p>
  <p>주문이 완료되었습니다.</p>
  <h2>[주문번호: ${order._id}] </h2>
  <table>
  <thead>
  <tr>
  <td><strong>상품명</strong></td>
  <td><strong>개수</strong></td>
  <td><strong align="right">상품가</strong></td>
  </thead>
  <tbody>
  ${order.orderItems
    .map(
      (item) => `
      <tr>
    <td>${item.name}</td>
    <td align="center">${item.quantity}</td>
    <td align="right">${item.price.toLocaleString()}원</td>
    </p>
    <hr/>
    <p>
    </tr>
    `
    )
    .join("\n")}
    
  </tbody>
  <tfoot>
  <tr>
  <td colspan="2">상품가격:</td>
  <td align="right"> ${order.itemsPrice.toLocaleString()}원</td>
  </tr>
  <tr>
  <td colspan="2">배송료:</td>
  <td align="right"> ${order.shippingPrice.toLocaleString()}원</td>
  </tr>
  <tr>
  <td colspan="2">합계:</td>
  <td align="right"><strong> ${order.totalPrice.toLocaleString()}원</strong></td>
  </tr>
  <tr>
  <td colspan="2">결제방식:</td>
  <td align="right"> ${order.paymentMethod}</td>
  </tr>
  </table>

  <h2>배송정보</h2>
  <p>
  받을사람:${order.shippingAddress.fullName}<br/>
  주소:${order.shippingAddress.address}<br/>
  상세주소:${order.shippingAddress.detailAddress}<br/>
  연락처:${order.shippingAddress.phoneNumber}<br/>
  우편번호:${order.shippingAddress.postalCode}<br/>
  </p>
  <hr/>
  <p>
  주문해주셔서 감사합니다.
  </p>
 `;
};
module.exports = {
  isAuth,
  isSocialAuth,
  generateToken,
  isAdmin,
  mailgun,
  payOrderEmailTemplate,
  baseUrl,
};
