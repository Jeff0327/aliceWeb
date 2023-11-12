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
      jsKey="6ab943e0d2ab9971181a9bde00bba505"
      onSuccess={handleSuccess}
      onFail={handleFailure}
      getProfile={true} // Retrieve user profile information
    />
  );
};

export default KakaoLoginButton;
