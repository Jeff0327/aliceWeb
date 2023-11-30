import axios from "axios";
import React, { useEffect } from "react";
import KakaoLogin from "react-kakao-login";
const KakaoLoginButton = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && window.kakao) {
      window.Kakao.init({ apiKey: `${process.env.KAKAO_JAVASCRIPT_KEY}` });
    }
  }, []);
  const kakaoOnSuccess = () => {
    console.log("로그인 성공");
  };
  const kakaoOnFailure = (error) => {
    console.log("로그인 실패:", error);
  };
  const kakaoLoginhandler = async () => {
    const data = await axios.get("/api/users/kakaosignin");
    console.log(data);
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
