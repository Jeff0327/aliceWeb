import Axios from "axios";
import { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Store } from "../Store";
// import KakaoLogin from "../components/KakaoLoginButton";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleLoginButton from "../components/SocialGoogleLogin";
import { getError } from "../utils";
export default function SigninScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect") || "/";
  const redirect = redirectInUrl ? redirectInUrl : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const clientId =
    "258796595331-7cb6sehma9pnihkr8dkhth4apjlkd37j.apps.googleusercontent.com";

  // const naverurl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naver_id}&state=${naverState}&redirect_uri=${REDIRECT_URI}`;

  const naverLoginHandler = async () => {
    try {
      const data = await Axios.get("/api/users/naverlogin");
      window.location.href = data.naverUrl;
    } catch (err) {
      console.error(err);
    }
  };
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await Axios.post("/api/users/signin", {
        email,
        password,
      });
      ctxDispatch({ type: "USER_SIGNIN", payload: data });
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate(redirect || "/");
    } catch (err) {
      toast.error(getError(err));
    }
  };
  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  // useEffect(() => {
  //   const loadKakaoAPI = async () => {
  //     try {
  //       await window.Kakao.Auth.login({
  //         success: async (authObj) => {
  //           const accessToken = authObj.access_token; // Use access_token from authObj
  //           console.log(accessToken);
  //           const response = await fetch("https://kapi.kakao.com/v2/user/me", {
  //             method: "GET",
  //             headers: {
  //               Authorization: `Bearer ${accessToken}`,
  //             },
  //           });

  //           if (response.ok) {
  //             const userData = await response.json();
  //             console.log("Kakao User Data:", userData);
  //           } else {
  //             console.error("Failed to fetch user data from Kakao API");
  //           }
  //         },
  //         fail: (error) => {
  //           console.error("Kakao login failed:", error);
  //         },
  //       });
  //     } catch (error) {
  //       console.error("An error occurred during Kakao login:", error);
  //     }
  //   };
  //   loadKakaoAPI();
  // }, []);
  // const handleLoginSuccess = (response) => {
  //   console.log("success msg");
  // };

  // const handleLoginFailure = (error) => {
  //   console.log("error");
  // };

  // const handleKakaoLogin = () => {
  //   if (!window.Kakao.isInitialized()) {
  //     console.error("Kakao SDK is not initialized");
  //     return;
  //   }

  //   window.Kakao.Auth.login({
  //     success: function (authObj) {
  //       console.log("Kakao login success:", authObj);
  //     },
  //     fail: function (err) {
  //       console.log("Kakao login failed:", err);
  //     },
  //   });
  // };

  // const naverLoginHandler = async () => {
  //   try {
  //     const response = await Axios.get("/api/users/naverlogin", {
  //       params: { redirectInUrl },
  //     });

  //     console.log(response); // Log the server response

  //     // Open a new window or redirect to the Naver login page
  //     window.location.href = response.data;
  //   } catch (err) {
  //     console.error("Axios error details:", err);

  //     // Log specific details about the response
  //     if (err.response) {
  //       console.error("Response data:", err.response.data);
  //       console.error("Response status:", err.response.status);
  //       console.error("Response headers:", err.response.headers);
  //     }
  //   }
  // };

  return (
    <Container className="small-container">
      <Helmet>
        <title>Sign In</title>
      </Helmet>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <div className="mb-3">
          <Button
            type="submit"
            style={{ borderColor: "black" }}
            className="btn btn-dark"
          >
            로그인
          </Button>
        </div>
        <div className="mb-3">
          새로 오셨나요?{" "}
          <Link to={`/signup?redirect=${redirect}`}>가입하기</Link>
        </div>
        <div className="mb-3">
          비밀번호를 잊어버렸나요?{" "}
          <Link to={`/forget-password`}>비밀번호 찾기</Link>
        </div>
        {/* <Form.Group className="mb-3">
          <KakaoLogin />
        </Form.Group> */}
        {/* <Form.Group className="mb-3">
          <img
            onClick={naverLoginHandler}
            alt="네이버 로그인"
            style={{ width: "20%", height: 35 }}
            src={`${process.env.PUBLIC_URL}/images/NaverLoginBtn.png`}
          />
        </Form.Group> */}
        <Form.Group className="mb-3">
          <GoogleOAuthProvider clientId={clientId}>
            <GoogleLoginButton />
          </GoogleOAuthProvider>
          <div
            className="social-login-container"
            onClick={() => naverLoginHandler()}
          >
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
        </Form.Group>
      </Form>
    </Container>
  );
}
