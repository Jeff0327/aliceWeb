import React, { useEffect, useState } from "react";

const KakaoLoginButton = () => {
  const [kakaoAppKey, setKakaoAppKey] = useState(null);
  const virtuKey = "f6ed75310902e580d4049cec52bae4d0";

  useEffect(() => {
    // Initialize Kakao SDK with the virtual key
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(virtuKey);
    }
  }, []);

  const kakaoOnSuccess = async (result) => {
    console.log("로그인 성공", result);
    // You can use the result to perform additional actions
    // Handle the server response accordingly
  };

  const kakaoOnFailure = (error) => {
    console.log("로그인 실패:", error);
  };

  const kakaoLoginhandler = () => {
    alert("서비스 준비중입니다.");
    // Check if Kakao.Auth is defined before calling login
    if (window.Kakao.Auth) {
      window.Kakao.Auth.login({
        success: kakaoOnSuccess,
        fail: kakaoOnFailure,
      });
    } else {
      console.error(
        "Kakao.Auth is not defined. Make sure the Kakao SDK is properly initialized."
      );
    }
  };

  return (
    <div
      className="social-login-container"
      onClick={kakaoLoginhandler}
      style={{ backgroundColor: "#F7E600" }}
    >
      <div>
        <img
          src={`${process.env.PUBLIC_URL}/images/kakaotalk-logo.png`}
          alt="카카오_이미지"
          className="social-Icon-img"
        />
      </div>
      <div className="social_login_text_box">카카오로 시작하기</div>
      <div className="social_login_blank_box"> </div>
    </div>
  );
};

export default KakaoLoginButton;
