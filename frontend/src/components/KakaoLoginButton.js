import React, { useEffect } from "react";
import KakaoLogin from "react-kakao-login";

const KakaoLoginButton = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && window.Kakao) {
      window.Kakao.init({ apiKey: `${process.env.KAKAO_JAVASCRIPT_KEY}` });
    }
  }, []);

  const kakaoOnSuccess = async (result) => {
    console.log("로그인 성공", result);

    // You can use the result to perform additional actions, such as sending the access token to your server
    // Example:
    // const response = await axios.post("/api/users/kakaologin", { accessToken: result.response.access_token });
    // Handle the server response accordingly
  };

  const kakaoOnFailure = (error) => {
    console.log("로그인 실패:", error);
  };

  const kakaoLoginhandler = () => {
    window.Kakao.Auth.login({
      success: kakaoOnSuccess,
      fail: kakaoOnFailure,
    });
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
