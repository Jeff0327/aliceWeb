import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

export default function CheckoutSteps(props) {
  return (
    <Row className="checkout-steps">
      <Col className={props.step1 ? "active" : ""}>로그인</Col>
      <Col className={props.step2 ? "active" : ""}>배송정보</Col>
      <Col className={props.step3 ? "active" : ""}>결제방식</Col>
      <Col className={props.step4 ? "active" : ""}>배송확인</Col>
    </Row>
  );
}
