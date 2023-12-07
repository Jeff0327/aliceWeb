import { useGoogleLogin } from "@react-oauth/google";

const SocialGoogleLogin = () => {
  const googleSocialLogin = useGoogleLogin({
    onSuccess: (codeResponse) => console.log("codeResponse:", codeResponse),
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
