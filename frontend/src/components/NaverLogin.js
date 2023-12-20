import axios from "axios";
import React from "react";
function NaverLogin() {
  const naverLoginHandler = async () => {
    alert("서비스 준비중입니다.");
    try {
      const state = "false";
      const { data } = await axios.get("/api/users/naver/login", {
        params: {
          state: state,
        },
      });
      console.log(data);
    } catch (error) {
      console.error("Error during Naver login:", error);
    }
  };
  return (
    <div
      className="social-login-container"
      onClick={() => naverLoginHandler()}
      style={{ backgroundColor: "#2DB400" }}
    >
      <div>
        <img
          src={`${process.env.PUBLIC_URL}/images/Naverlogo.png`}
          alt="네이버_이미지"
          className="social-Icon-img"
        />
      </div>
      <div className="social_login_text_box" style={{ color: "#FFFFFF" }}>
        네이버로 시작하기
      </div>
      <div className="social_login_blank_box"> </div>
    </div>
  );
}

export default NaverLogin;
