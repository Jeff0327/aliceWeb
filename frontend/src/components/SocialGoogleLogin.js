import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
const SocialGoogleLogin = () => {
  const googleSocialLogin = useGoogleLogin({
    onSuccess: async (res) => {
      console.log("codeResponse:", res);

      const accessToken = res.code;
      await getUserInfo(accessToken);
    },

    flow: "auth-code",
  });
  const getUserInfo = async (accessToken) => {
    try {
      const response = await axios.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Access user information in the response.data object
      const userInfo = response.data;
      console.log("User Info:", userInfo);

      // Now you can use the user information as needed
    } catch (error) {
      console.error("Error fetching user information:", error);
    }
  };
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

export default SocialGoogleLogin;
