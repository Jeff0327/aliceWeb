import { useGoogleLogin } from "@react-oauth/google";
const GoogleLogin = () => {
  const googleSocialLogin = useGoogleLogin({
    onSuccess: async (accessToken) => {
      alert("서비스 준비중입니다.");
      const token = accessToken.code;
      console.log(token);
      // await getUserInfo(token);
    },
    flow: "token",
  });

  // const getUserInfo = async (accessToken) => {
  //   try {
  //     const response = await axios.get("/api/users/getUserInfo", {
  //       params: { accessToken },
  //     });
  //     console.log(response);
  //   } catch (error) {
  //     console.error("Error fetching user information:", error);
  //   }
  // };

  return (
    <div className="social-login-container" onClick={() => googleSocialLogin()}>
      <div>
        <img
          src={`${process.env.PUBLIC_URL}/images/googleicon3.png`}
          alt="구글_이미지"
          className="social-Icon-img"
        />
      </div>
      <div className="social_login_text_box">구글로 시작하기</div>
      <div className="social_login_blank_box"> </div>
    </div>
  );
};

export default GoogleLogin;
