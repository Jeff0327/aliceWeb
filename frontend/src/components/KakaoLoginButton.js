import axios from "axios";
import React, { useEffect } from "react";
import KakaoLogin from "react-kakao-login";
const KakaoLoginButton = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && window.kakao) {
      window.Kakao.init({ apiKey: `${process.env.KAKAO_JAVASCRIPT_KEY}` });
    }
  }, []);
  const kakaoOnSuccess = async () => {
    const { data } = await axios.post("https://kauth.kakao.com/oauth/token", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });
    console.log(data);
  };
  const kakaoOnFailure = (error) => {
    console.log("로그인 실패:", error);
  };
  const kakaoLoginhandler = async () => {
    try {
      await axios.get("/api/users/kakaosignin");
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <KakaoLogin
      token={`${process.env.KAKAO_JAVASCRIPT_KEY}`}
      onSuccess={kakaoOnSuccess}
      onFail={kakaoOnFailure}
      onClick={kakaoLoginhandler}
    />
  );
};

export default KakaoLoginButton;
