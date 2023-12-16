import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

const SocialGoogleLogin = () => {
  const googleSocialLogin = useGoogleLogin({
    onSuccess: async (accessToken) => {
      const client_id =
        "258796595331-7cb6sehma9pnihkr8dkhth4apjlkd37j.apps.googleusercontent.com";
      // Modify the authentication URL to use the Implicit Grant flow
      const authUrl = `https://accounts.google.com/o/oauth2/auth?response_type=token&scope=https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile&client_id=${client_id}&redirect_uri=https://rosemarry.kr/api/users/google/callback/`;

      // Redirect the user to the modified authentication URL
      console.log(authUrl);

      await getUserInfo(accessToken.code);
    },
    flow: "token",
  });

  const getUserInfo = async (accessToken) => {
    try {
      const response = await axios.get(
        "https://www.googleapis.com/auth/v1/userinfo.email",
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(response);
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
