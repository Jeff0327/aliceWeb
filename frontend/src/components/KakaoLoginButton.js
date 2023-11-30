import React, { useEffect } from "react";
import KakaoLogin from "react-kakao-login";
const KakaoLoginButton = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.Kakao.init(process.env.KAKAO_JAVASCRIPT_KEY);
    }
  }, []);
  const kakaoOnSuccess = () => {
    console.log("로그인 성공");
  };
  const kakaoOnFailure = (error) => {
    console.log("로그인 실패:", error);
  };
  return (
    <>
      <KakaoLogin
        token={process.env.KAKAO_JAVASCRIPT_KEY}
        onSuccess={kakaoOnSuccess}
        onFail={kakaoOnFailure}
        render={({ onClick }) => (
          <div
            onClick={(e) => {
              e.preventDefault();
              onClick();
            }}
          >
            카카오로 로그인하기
          </div>
        )}
      />
    </>
  );
};

export default KakaoLoginButton;
