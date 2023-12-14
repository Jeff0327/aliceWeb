import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

const SocialGoogleLogin = () => {
  const googleSocialLogin = useGoogleLogin({
    onSuccess: async (res) => {
      console.log("Authorization Code:", res.code);

      try {
        const response = await axios.post(
          "https://www.googleapis.com/oauth2/v4/token",
          {
            code: res.code,
            client_id:
              "258796595331-i3a9759p2fjajsg80gr3fsuavbdko1ld.apps.googleusercontent.com",
            client_secret: "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",
            redirect_uri: "https://rosemarry.kr/api/users/google/callback/",
            grant_type: "authorization_code",
          }
        );

        const accessToken = response.data.access_token;
        console.log("Access Token:", accessToken);

        // Now you can use the access token to fetch user information
        await getUserInfo(accessToken);
      } catch (error) {
        console.error("Error exchanging code for access token:", error);
      }
    },
    flow: "auth-code",
  });

  const getUserInfo = async (accessToken) => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
      );
      console.log(response.data);

      const userInfo = response.data;
      console.log("User Info:", userInfo);
    } catch (error) {
      console.error("Error fetching user information:", error.response.data);
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
