import { useGoogleLogin } from "@react-oauth/google";

const SocialGoogleLogin = () => {
  const googleSocialLogin = useGoogleLogin({
    onSuccess: async (accessToken) => {
      const profile = accessToken.getBasicProfile();
      const userdata = {
        email: profile.getEmail(),
        image: profile.getImageUrl(),
        name: profile.getName(),
      };

      console.log(userdata);
    },
    flow: "token",
  });

  // const getUserInfo = async (accessToken) => {
  //   try {
  //     const response = await axios.get(
  //       "https://www.googleapis.com/auth/v1/userinfo.email",
  //       {
  //         headers: {

  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       }
  //     );
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

export default SocialGoogleLogin;
