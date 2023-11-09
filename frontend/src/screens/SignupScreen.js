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
export default function SignupScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get("redirect");
  const redirect = redirectInUrl ? redirectInUrl : "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }
    try {
      const { data } = await Axios.post("/api/users/signup", {
        name,
        email,
        password,
      });

      ctxDispatch({ type: "USER_SIGNIN", payload: data });
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate(redirect || "/");
    } catch (err) {
      const errorResponse = getError(err);

      const errorName = errorResponse.includes("dup key: { name:");
      const errorEmail = errorResponse.includes("dup key: { email:");

      if (errorName) {
        toast.error("사용중인 이름입니다.");
      } else if (errorEmail) {
        toast.error("사용중인 이메일입니다.");
      } else {
        toast.error(getError(err));
      }
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <Container className="container">
      <Helmet>
        <title>RoseMarry</title>
      </Helmet>
      <h1 className="my-3">가입하기</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>이름</Form.Label>
          <Form.Control onChange={(e) => setName(e.target.value)} required />
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email(아이디)</Form.Label>
          <Form.Control
            type="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          {
            <div className="text-muted info-text">
              상품구매시 구매내역이 메일로 전송됩니다.
            </div>
          }
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>비밀번호</Form.Label>
          <Form.Control
            type="password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <Form.Group className="mb-3" controlId="confirmPassword">
            <Form.Label>비밀번호 확인</Form.Label>
            <Form.Control
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Form.Group>
        </Form.Group>
        <div className="mb-3">
          <Button type="submit" className="btn-dark">
            가입하기
          </Button>
        </div>
        <div className="mb-3">
          이미 계정이 있으시나요?{" "}
          <Link to={`/signin?redirect=${redirect}`}>로그인</Link>
        </div>
      </Form>
    </Container>
  );
}
