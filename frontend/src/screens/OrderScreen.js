import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { loadTossPayments } from "@tosspayments/payment-sdk";
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

  const clientKey = process.env.TOSSPAYMENT_CLIENT_KEY;
  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();
  // const [oPay, setOPay] = useState(null);
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
  // useEffect(() => {
  //   const loadNaverPayScript = async () => {
  //     // Dynamically load the NaverPay script
  //     const script = document.createElement("script");
  //     script.src =
  //       "https://dev.apis.naver.com/cocacola158500@gmail.com/naverpay/payments/v2.2/apply/payment";
  //     script.async = true;
  //     document.head.appendChild(script);
  //     console.log(window.Naver);
  //     script.onload = () => {
  //       // Once the script is loaded, initialize NaverPay
  //       const naverPayInstance = window.Naver.Pay.create({
  //         mode: "production", // development or production
  //         clientId: "zzGqNBIM5P9dLWFD3ByE",
  //       });
  //       setOPay(naverPayInstance);
  //     };
  //   };

  //   // Load NaverPay script only if the payment method is NaverPay
  //   if (order.paymentMethod === "NaverPay") {
  //     loadNaverPayScript();
  //   }
  // }, [order.paymentMethod]);

  // const handlePayment = () => {
  //   window.KakaoPay.requestPayment({
  //     partner_order_id: "YOUR_ORDER_ID",
  //     partner_user_id: "asd",
  //     item_name: order.name,
  //     quantity: 1,
  //     total_amount: 10000, // Set your total amount
  //     vat_amount: 0, // Set your VAT amount
  //     tax_free_amount: 0, // Set your tax-free amount
  //     approval_url: "rosemarry.kr",
  //     fail_url: "YOUR_FAIL_URL",
  //     cancel_url: "YOUR_CANCEL_URL",
  //   });
  // };
  const tosspayhandler = async () => {
    try {
      const { data } = await loadTossPayments(clientKey).then(
        (tossPayments) => {
          console.log(tossPayments);
          // ------ 결제창 띄우기 ------
          tossPayments.requestPayment("카드", {
            // 결제수단 파라미터
            // 결제 정보 파라미터
            // 더 많은 결제 정보 파라미터는 결제창 Javascript SDK에서 확인하세요.
            // https://docs.tosspayments.com/reference/js-sdk
            amount: order.totalPrice, // Specify the amount to be paid
            orderId: orderId,
            orderName: order.name,
            customerName: "구매자이름",
            successUrl: "https://naver.com",
            failUrl: "https://google.com",
          });
        }
      );
      const result = await data.json();
      console.log(result);
      // ------ 결제창을 띄울 수 없는 에러 처리 ------
      // 메서드 실행에 실패해서 reject 된 에러를 처리하는 블록입니다.
      // 결제창에서 발생할 수 있는 에러를 확인하세요.
      // https://docs.tosspayments.com/reference/error-codes#결제창공통-sdk-에러
    } catch (err) {
      if (error.code === "USER_CANCEL") {
        // 결제 고객이 결제창을 닫았을 때 에러 처리
      } else if (error.code === "INVALID_CARD_COMPANY") {
        // 유효하지 않은 카드 코드에 대한 에러 처리
      }
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

  // const naverpayHandler = () => {
  //   if (oPay) {
  //     oPay.open({
  //       merchantUserKey: "D0286BE0-E668-4139-82AD-564433286EE2",
  //       merchantPayKey: "가맹점 주문 번호",
  //       productName: "상품명을 입력하세요",
  //       totalPayAmount: "1000",
  //       taxScopeAmount: "1000",
  //       taxExScopeAmount: "0",
  //       returnUrl: "사용자 결제 완료 후 결제 결과를 받을 URL",
  //     });
  //   }
  // };

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
                      <div>
                        {order.paymentMethod === "PayPal" ? (
                          <PayPalButtons
                            createOrder={createOrder}
                            onApprove={onApprove}
                            onError={onError}
                          ></PayPalButtons>
                        ) : order.paymentMethod === "NaverPay" ? (
                          <>
                            {/* <Button id="naverPayBtn" onClick={naverpayHandler}>
                              네이버페이 결제
                            </Button> */}
                            <Button onClick={tosspayhandler}>
                              토스결제하기
                            </Button>
                          </>
                        ) : (
                          <>
                            {/* <Button onClick={handlePayment}>결제하기</Button> */}
                          </>
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
