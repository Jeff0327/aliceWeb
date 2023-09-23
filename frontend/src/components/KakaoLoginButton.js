import React from "react";
import KakaoLogin from "react-kakao-login";

const KakaoLoginButton = ({ onLoginSuccess, onLoginFailure }) => {
  const handleSuccess = (response) => {
    console.log("Kakao login success:", response);
    if (onLoginSuccess) {
      onLoginSuccess(response);
    }
  };

  const handleFailure = (error) => {
    console.error("Kakao login error:", error);
    if (onLoginFailure) {
      onLoginFailure(error);
    }
  };

  return (
    <KakaoLogin
      jsKey="YOUR_KAKAO_SDK_KEY"
      onSuccess={handleSuccess}
      onFail={handleFailure}
      getProfile={true} // Retrieve user profile information
    />
  );
};

export default KakaoLoginButton;
