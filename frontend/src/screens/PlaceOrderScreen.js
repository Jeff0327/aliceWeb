import Axios from "axios";
import React, { useContext, useEffect, useReducer, useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Store } from "../Store";
import CheckoutSteps from "../components/CheckoutSteps";
import LoadingBox from "../components/LoadingBox";
import { getError } from "../utils";
const reducer = (state, action) => {
  switch (action.type) {
    case "CREATE_REQUEST":
      return { ...state, loading: true };
    case "CREATE_SUCCESS":
      return { ...state, loading: false };
    case "CREATE_FAIL":
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function PlaceOrderScreen() {
  const navigate = useNavigate();
  const [getToken, setGetToken] = useState("");
  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });

  const { state, dispatch: ctxDispatch } = useContext(Store);

  const { cart, userInfo, kakaoUser } = state;

  console.log(userInfo);
  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.2345 => 123.23
  cart.itemsPrice = round2(
    cart.cartItems.reduce(
      (a, c) => a + c.color.selectColor.quantity * c.price,
      0
    )
  );
  cart.shippingPrice = cart.itemsPrice > 50000 ? 0 : 0; //5만원 이상 결제시 배송료 무료 5만원미만 결제시 배송료 2500

  cart.totalPrice = cart.itemsPrice + cart.shippingPrice;

  const placeOrderHandler = async () => {
    // const tokenToUse =
    //   userInfo && userInfo.token
    //     ? userInfo.token
    //     : kakaoUser && kakaoUser.kakaoToken
    //     ? kakaoUser.kakaoToken
    //     : false;

    if (!userInfo || !userInfo.token) {
      if (!kakaoUser || !kakaoUser.kakaoToken) {
        navigate("/signin");
        return;
      } else {
        setGetToken(kakaoUser.kakaoToken);
      }
    } else {
      setGetToken(userInfo.token);
      console.log(`${getToken}`);
    }

    if (loading) {
      return;
    }

    const updatedOrderItems = cart.cartItems.map((item) => ({
      ...item,
      color: [
        {
          name: item.color.selectColor.name, //색상이름
          value: item.color.selectColor.value, //색상코드표값
          quantity: item.color.selectColor.quantity, //제품색상재고
        },
      ],
    }));
    if (userInfo) {
      try {
        dispatch({ type: "CREATE_REQUEST" });

        const { data } = await Axios.post(
          `/api/orders`,
          {
            orderItems: updatedOrderItems,
            shippingAddress: cart.shippingAddress,
            detailAddress: cart.detailAddress,
            paymentMethod: cart.paymentMethod,
            itemsPrice: cart.itemsPrice,
            shippingPrice: cart.shippingPrice,
            totalPrice: cart.totalPrice,
          },
          {
            headers: {
              Authorization: `Bearer ${getToken}`,
            },
            withCredentials: true,
          }
        );
        ctxDispatch({ type: "CART_CLEAR" });
        dispatch({ type: "CREATE_SUCCESS" });
        localStorage.removeItem("cartItems");
        navigate(`/order/${data.order._id}`, {
          state: {
            colorName: updatedOrderItems.map((item) => item.color.selectColor),
          },
        });
      } catch (err) {
        dispatch({ type: "CREATE_FAIL" });
        toast.error(getError(err));
      }
    } else if (kakaoUser) {
      try {
        dispatch({ type: "CREATE_REQUEST" });

        const { data } = await Axios.post(
          `/api/orders/social`,
          {
            orderItems: updatedOrderItems,
            shippingAddress: cart.shippingAddress,
            detailAddress: cart.detailAddress,
            paymentMethod: cart.paymentMethod,
            itemsPrice: cart.itemsPrice,
            shippingPrice: cart.shippingPrice,
            totalPrice: cart.totalPrice,
          },
          {
            headers: {
              Authorization: `Bearer ${getToken}`,
            },
            withCredentials: true,
          }
        );
        ctxDispatch({ type: "CART_CLEAR" });
        dispatch({ type: "CREATE_SUCCESS" });
        localStorage.removeItem("cartItems");
        navigate(`/order/${data.order._id}`, {
          state: {
            colorName: updatedOrderItems.map((item) => item.color.selectColor),
          },
        });
      } catch (err) {
        dispatch({ type: "CREATE_FAIL" });
        toast.error(getError(err));
      }
    }
  };

  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate("/payment");
    }
  }, [cart, navigate]);

  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
      <Helmet>
        <title>RoseMarry</title>
      </Helmet>
      <h1 className="my-3">주문 미리보기</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>배송정보</Card.Title>
              <Card.Text>
                <strong>이름:</strong> {cart.shippingAddress.fullName} <br />
                <strong>주소: </strong> {cart.shippingAddress.address}
                <br />
                <strong>상세주소: </strong> {cart.shippingAddress.detailAddress}
                <br />
                <strong>연락처: </strong>
                {cart.shippingAddress.phoneNumber}
                <br />
                <strong>우편번호: </strong>
                {cart.shippingAddress.postalCode}
                <br />
                <strong>배송메세지: </strong>
                {cart.shippingAddress.deliveryMsg}
              </Card.Text>
              <Link to="/shipping">수정하기</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>결제정보</Card.Title>
              <Card.Text>
                <strong>결제방식:</strong> {cart.paymentMethod}
              </Card.Text>
              <Link to="/payment">수정하기</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>상품정보</Card.Title>
              <ListGroup variant="flush">
                {cart.cartItems.map((item, index) => (
                  <ListGroup.Item
                    key={`${item._id}-${item.color._id}-${index}`}
                  >
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>{" "}
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </Col>
                      <Col md={2}>{item.color.selectColor.name}</Col>
                      <Col md={2}>
                        <span>{item.color.selectColor.quantity}개</span>
                      </Col>
                      <Col md={2}>{item.price}</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Link to="/cart">수정하기</Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>주문정보</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>상품가격</Col>
                    <Col>{cart.itemsPrice.toLocaleString()}원</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>배송료</Col>
                    <Col>{cart.shippingPrice.toLocaleString()}원</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>합계</strong>
                    </Col>
                    <Col>
                      <strong>{cart.totalPrice.toLocaleString()}원</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      onClick={placeOrderHandler}
                      disabled={cart.cartItems.length === 0}
                      variant="success"
                    >
                      주문하기
                    </Button>
                  </div>
                  {loading && <LoadingBox></LoadingBox>}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
