import axios from "axios";
import React, { useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { Store } from "../Store";
const KakaoLoginButton = () => {
  // const [kakaoAppKey, setKakaoAppKey] = useState(null);
  const virtuKey = "6ab943e0d2ab9971181a9bde00bba505";
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { kakaoUser } = state;
  useEffect(() => {
    // Initialize Kakao SDK with the virtual key
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(virtuKey);
    }
  }, [kakaoUser]);

  const kakaoOnSuccess = async () => {
    try {
      if (window.Kakao.Auth && window.Kakao.Auth.getAccessToken()) {
        const response = await axios.get("https://kapi.kakao.com/v2/user/me", {
          headers: {
            Authorization: `Bearer ${window.Kakao.Auth.getAccessToken()}`,
          },
        });
        const kakaoInfo = {
          email: response.data.kakao_account.email,
          has_email: response.data.kakao_account.has_email,
          kakaoToken: `${window.Kakao.Auth.getAccessToken()}`,
        };

        const { data } = await axios.post("/api/users/socialsignup", {
          kakaoInfo,
        });
        ctxDispatch({
          type: "KAKAO_SIGNIN",
          payload: {
            data,
          },
        });
        localStorage.setItem("kakaoUser", JSON.stringify(data));

        if (response.data) {
          window.location.href = "/";
        }
      } else {
        toast.error(
          "토큰이 만료되었습니다. 관리자에게 문의하세요[error code:100]"
        );
      }
    } catch (error) {
      console.error("Error fetching Kakao user data:", error);
    }
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
