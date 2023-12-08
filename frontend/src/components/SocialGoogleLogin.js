import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
const SocialGoogleLogin = () => {
  const googleSocialLogin = useGoogleLogin({
    onSuccess: async (res) => {
      console.log("codeResponse:", res);

      const tokens = await axios.get("/api/users/googlelogin", {
        headers: { Authorization: `Bearer ${res.code}` },
      });

      console.log(tokens);
    },

    flow: "auth-code",
  });
  return (
    <div className="social-google-login" onClick={() => googleSocialLogin()}>
      <div>
        <img
          src={`${process.env.PUBLIC_URL}/images/googleicon3.png`}
          alt="google_login"
          className="googleIcon-img"
        />
      </div>
      <div className="social_login_text_box">구글로 시작하기</div>
      <div className="social_login_blank_box"> </div>
    </div>
  );
};

export default SocialGoogleLogin;
