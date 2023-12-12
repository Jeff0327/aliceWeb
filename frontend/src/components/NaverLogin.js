function NaverLogin() {
  const naver_id = "zzGqNBIM5P9dLWFD3ByE";

  const REDIRECT_URI = "https://rosemarry.kr/api/users/naver/callback";
  const STATE = "false";
  const naverurl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naver_id}&state=${STATE}&redirect_uri=${REDIRECT_URI}`;

  const naverLoginHandler = () => {
    window.location.href = naverurl;
  };

  return (
    <div className="social-login-container" onClick={() => naverLoginHandler()}>
      <div>
        <img
          src={`${process.env.PUBLIC_URL}/images/Naverlogo.png`}
          alt="네이버_로그인"
          className="social-Icon-img"
        />
      </div>
      <div className="social_login_text_box">네이버로 시작하기</div>
      <div className="social_login_blank_box"> </div>
    </div>
  );
}

export default NaverLogin;
