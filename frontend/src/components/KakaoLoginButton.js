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
    window.location.href = "/api/users/kakaosignin";
    try {
      const response = await axios.post(
        "https://kauth.kakao.com/oauth/token",
        {
          grant_type: "authorization_code",
          client_id: `${process.env.KAKAO_RESTAPI_KEY}`,
          redirect_uri: `${process.env.KAKAO_REDIRECT_URI}`,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
          },
        }
      );

      // Now you can use the obtained access token (response.data.access_token) for further actions

      // For example, you can store the token in the user session or database

      console.log(response);
    } catch (error) {
      console.log(error);
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
