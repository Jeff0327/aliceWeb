import Axios from "axios";
import { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Store } from "../Store";
import KakaoLoginButton from "../components/KakaoLoginButton";
import { getError } from "../utils";
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
    // Check if Kakao JavaScript SDK is already initialized
    if (!window.Kakao.isInitialized()) {
      // Initialize Kakao JavaScript SDK with your API key
      window.Kakao.init(`${process.env.KAKAO_JAVASCRIPT_KEY}`);
    }
  }, []);
  if (!window.Kakao.isInitialized()) {
    // Initialize Kakao JavaScript SDK with your API key
    window.Kakao.init(`${process.env.KAKAO_JAVASCRIPT_KEY}`);
  }
  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);
  useEffect(() => {
    const loadKakaoAPI = async () => {
      try {
        // Open the Kakao login popup
        await window.Kakao.Auth.login({
          success: async (authObj) => {
            // After successful login, you can fetch user information or perform other actions
            const accessToken = userInfo.token;

            // Make a fetch request to Kakao API to get user profile
            const response = await fetch("https://kapi.kakao.com/v2/user/me", {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

            if (response.ok) {
              const userData = await response.json();
              console.log("Kakao User Data:", userData);
              // Perform actions with user data
            } else {
              console.error("Failed to fetch user data from Kakao API");
            }
          },
          fail: (error) => {
            console.error("Kakao login failed:", error);
            // Handle login failure
          },
        });
      } catch (error) {
        console.error("An error occurred during Kakao login:", error);
        // Handle other errors, if any
      }
    };
    loadKakaoAPI();
  }, [userInfo]);
  const handleLoginSuccess = (response) => {
    // Handle successful login (e.g., send token to your server)
  };

  const handleLoginFailure = (error) => {
    // Handle login failure (e.g., show an error message)
  };

  const handleKakaoLogin = () => {
    // Check if Kakao JavaScript SDK is initialized
    if (!window.Kakao.isInitialized()) {
      console.error("Kakao SDK is not initialized");
      return;
    }

    // Perform Kakao login
    window.Kakao.Auth.login({
      success: function (authObj) {
        console.log("Kakao login success:", authObj);
        // Handle the successful login here
      },
      fail: function (err) {
        console.log("Kakao login failed:", err);
        // Handle login failure here
      },
    });
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
        <Form onSubmit={submitHandler}>
          {/* ... (rest of your form code) */}
          <div className="mb-3">
            <KakaoLoginButton
              onLoginSuccess={handleLoginSuccess}
              onLoginFailure={handleLoginFailure}
              onClick={handleKakaoLogin}
            />
          </div>
        </Form>
      </Form>
    </Container>
  );
}
