import Axios from "axios";
import { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Store } from "../Store";
import { getError } from "../utils";
// import { GoogleLogin } from "react-google-login";
export default function SigninScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectInUrl ? redirectInUrl : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

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
  //   if (!window.Kakao.isInitialized()) {
  //     window.Kakao.init(`${process.env.KAKAO_JAVASCRIPT_KEY}`);
  //   }
  // }, []);

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
  const responseGoogle = (response) => {
    console.log(response);
  };

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
        {/* <Form onSubmit={submitHandler}>
          <div className="mb-3">
            <KakaoLoginButton
              onLoginSuccess={handleLoginSuccess}
              onLoginFailure={handleLoginFailure}
              onClick={() => handleKakaoLogin}
            />
          </div>
        </Form> */}

        {/* <Form>
          <GoogleLogin
            clientId="258796595331-jcpcgb5jthi75dns0lrudp4bfus8obmr.apps.googleusercontent.com"
            buttonText="Google 로그인"
            onSuccess={responseGoogle}
            onFailure={responseGoogle}
          />
        </Form> */}
      </Form>
    </Container>
  );
}
