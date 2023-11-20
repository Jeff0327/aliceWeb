import axios from "axios";
import React from "react";
import KakaoLogin from "react-kakao-login";
const KakaoLoginButton = () => {
  const kakaoOnSuccess = async (e) => {
    const { data } = await axios.post("/api/kakaosignin", {
      headers: { Authorization: `Bearer ${process.env.KAKAO_JAVASCRIPT_KEY}` },
    });
    const idToken = e.response.access_token;
    console.log(data);
    console.log(idToken);
  };
  const kakaoOnFailure = (error) => {
    console.log(error);
  };
  return (
    <>
      <KakaoLogin
        token={`F7B06E3AC96D23F77CFB`}
        onSuccess={kakaoOnSuccess}
        onFail={kakaoOnFailure}
      />
    </>
  );
};

export default KakaoLoginButton;
