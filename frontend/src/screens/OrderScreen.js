import { Bootpay } from "@bootpay/client-js";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import axios from "axios";
import React, { useContext, useEffect, useReducer } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Store } from "../Store";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox.js";
import { getError } from "../utils";
function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, order: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "PAY_REQUEST":
      return { ...state, loadingPay: true };
    case "PAY_SUCCESS":
      return { ...state, loadingPay: false, successPay: true };
    case "PAY_FAIL":
      return { ...state, loadingPay: false };
    case "PAY_RESET":
      return { ...state, loadingPay: false, successPay: false };

    case "DELIVER_REQUEST":
      return { ...state, loadingDeliver: true };
    case "DELIVER_SUCCESS":
      return { ...state, loadingDeliver: false, successDeliver: true };
    case "DELIVER_FAIL":
      return { ...state, loadingDeliver: false };
    case "DELIVER_RESET":
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
      };
    default:
      return state;
  }
}

export default function OrderScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();

  const [
    {
      loading,
      error,
      order,
      successPay,
      loadingPay,
      loadingDeliver,
      successDeliver,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: "",
    successPay: false,
    loadingPay: false,
  });

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: order.totalPrice },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  }

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: "PAY_REQUEST" });
        const { data } = await axios.put(
          `/api/orders/${order._id}/pay`,
          details,
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: "PAY_SUCCESS", payload: data });
        toast.success("결제가 완료되었습니다.");
      } catch (err) {
        dispatch({ type: "PAY_FAIL", payload: getError(err) });
        toast.error(getError(err));
      }
    });
  }
  function onError(err) {
    toast.error(getError(err));
  }

  const bootpayResult = async () => {
    try {
      const response = await Bootpay.requestPayment({
        //- 요청 데이터
      });
      switch (response.event) {
        case "issued":
          // 가상계좌 입금 완료 처리
          break;
        case "done":
          try {
            console.log("result:", response);
            console.log(
              "response.result.AuthToken:",
              response.result.AuthToken
            );
            dispatch({ type: "PAY_REQUEST" });
            const { data } = await axios.put(
              `/api/orders/${order._id}/bootpay`,
              {
                headers: `Bearer ${userInfo.token}`,
              }
            );
            dispatch({ type: "PAY_SUCCESS", payload: data });
            toast.success("결제가 완료되었습니다.");
          } catch (err) {
            dispatch({ type: "PAY_FAIL", payload: getError(err) });
            toast.error(getError(err));
          }

          // 결제 완료 처리
          break;
        case "confirm": //payload.extra.separately_confirmed = true; 일 경우 승인 전 해당 이벤트가 호출됨
          console.log(response.receipt_id);
          /**
           * 1. 클라이언트 승인을 하고자 할때
           * // validationQuantityFromServer(); //예시) 재고확인과 같은 내부 로직을 처리하기 한다.
           */

          const confirmedData = await Bootpay.confirm(); //결제를 승인한다
          if (confirmedData.event === "done") {
            //결제성공
          }
          /**
           * 2. 서버 승인을 하고자 할때
           * // requestServerConfirm(); //예시) 서버 승인을 할 수 있도록  API를 호출한다. 서버에서는 재고확인과 로직 검증 후 서버승인을 요청한다.
           * Bootpay.destroy(); //결제창을 닫는다.
           */
          break;
        default:
          // 기본값 호출
          break;
      }
    } catch (e) {
      // // 결제 진행중 오류 발생
      // e.error_code - 부트페이 오류 코드
      // e.pg_error_code - PG 오류 코드
      // e.message - 오류 내용
      toast.error(e.message);

      switch (e.event) {
        case "cancel":
          // 사용자가 결제창을 닫을때 호출
          break;
        case "error":
          toast.error(`결제 중 오류가발생했습니다:${e.error_code}`);
          break;
        default:
          // 기본값 호출
          break;
      }
    }
  };
  const bootpayhandler = async () => {
    try {
      await Bootpay.requestPayment({
        application_id: `655c7fea00c78a001aaf57ac`,
        price: order.totalPrice,

        order_name: `${order.orderItems.map((e) => e.name)}`,
        order_id: `${order.orderItems.map((e) => e._id)}`,
        user: {
          id: `${userInfo._id}`,
          username: `${order.shippingAddress.fullName}`,
          phone: `${order.shippingAddress.phoneNumber}`,
          email: `${userInfo.email}`,
        },

        extra: {
          open_type: "iframe",
          card_quota: "0,2,3",
          escrow: false,
        },
      });
      await bootpayResult();
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };

    if (!userInfo) {
      return navigate("/login");
    }
    if (
      !order._id ||
      successPay ||
      successDeliver ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: "PAY_RESET" });
      }
      if (successDeliver) {
        dispatch({ type: "DELIVER_RESET" });
      }
    } else {
      const loadPaypalScript = async () => {
        const { data: clientId } = await axios.get("/api/keys/paypal", {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        paypalDispatch({
          type: "resetOptions",
          value: {
            "client-id": clientId,
            currency: "USD",
          },
        });
        paypalDispatch({ type: "setLoadingStatus", value: "pending" });
      };
      loadPaypalScript();
    }
  }, [
    order,
    userInfo,
    orderId,
    navigate,
    paypalDispatch,
    successPay,
    successDeliver,
  ]);

  async function deliverOrderHandler() {
    try {
      dispatch({ type: "DELIVER_REQUEST" });
      const { data } = await axios.put(
        `/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "DELIVER_SUCCESS", payload: data });
      toast.success("주문이 배송되었습니다.");
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: "DELIVER_FAIL" });
    }
  }

  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>RoseMarry</title>
      </Helmet>
      <h1 className="my-3">주문번호 [{orderId}]</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>배송정보</Card.Title>
              <Card.Text>
                <strong>이름:</strong> {order.shippingAddress.fullName} <br />
                <strong>주소: </strong> {order.shippingAddress.address}
                <br />
                <strong>상세주소: </strong>
                {order.shippingAddress.detailAddress}
                <br />
                <strong>연락처: </strong>
                {order.shippingAddress.phoneNumber}
                <br />
                <strong>우편번호: </strong>
                {order.shippingAddress.postalCode}
                <br />
                <strong>배송메세지: </strong>
                {order.shippingAddress.deliveryMsg}
                &nbsp;
              </Card.Text>
              {order.isDelivered ? (
                <MessageBox variant="success">
                  배송시작: {order.deliveredAt}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">배송 전</MessageBox>
              )}
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>결제정보</Card.Title>
              <Card.Text>
                <strong>결제방식</strong> {order.paymentMethod}
              </Card.Text>
              {order.isPaid ? (
                <MessageBox variant="success">결제일{order.paidAt}</MessageBox>
              ) : (
                <MessageBox variant="danger">결제 전</MessageBox>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>상품정보</Card.Title>
              <ListGroup variant="flush">
                {order.orderItems.map((item) => (
                  <ListGroup.Item key={`${item._id}-${item.color._id}`}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>{" "}
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </Col>
                      <Col md={3}>{item.color.map((e) => e.name)}</Col>
                      <Col md={3}>{item.price.toLocaleString()}원</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>주문 정보</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>상품가격</Col>
                    <Col>{order.itemsPrice.toLocaleString()}원</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>배송료</Col>
                    <Col>{order.shippingPrice.toLocaleString()}원</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>합계</strong>
                    </Col>
                    <Col>
                      <strong>{order.totalPrice.toLocaleString()}원</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                {!order.isPaid && (
                  <ListGroup.Item>
                    {isPending ? (
                      <LoadingBox />
                    ) : (
                      <div className="d-grid">
                        {order.paymentMethod === "PayPal" ? (
                          <PayPalButtons
                            createOrder={createOrder}
                            onApprove={onApprove}
                            onError={onError}
                          ></PayPalButtons>
                        ) : (
                          <Row>
                            <Col>
                              <Button
                                type="button"
                                variant="success"
                                className="btn btn-success btn-width"
                                onClick={bootpayhandler}
                              >
                                결제하기
                              </Button>
                            </Col>
                          </Row>
                        )}
                      </div>
                    )}
                    {loadingPay && <LoadingBox></LoadingBox>}
                  </ListGroup.Item>
                )}
                {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                  <ListGroup.Item>
                    {loadingDeliver && <LoadingBox></LoadingBox>}
                    <div className="d-grid">
                      <Button type="button" onClick={deliverOrderHandler}>
                        배송하기
                      </Button>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
