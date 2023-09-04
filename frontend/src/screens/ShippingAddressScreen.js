import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import DaumPostcode from "react-daum-postcode";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CheckoutSteps from "../components/CheckoutSteps";
import { Store } from "../Store";
export default function ShippingAddressScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const [addressPopup, setAddressPopup] = useState(false);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(true);
  const {
    fullBox,
    userInfo,
    cart: { shippingAddress },
  } = state;
  const [fullName, setFullName] = useState(shippingAddress.fullName || "");
  const [address, setAddress] = useState(shippingAddress.address || "");
  const [detailAddress, setDetailAddress] = useState(
    shippingAddress.detailAddress || ""
  );
  const [phoneNumber, setPhoneNumber] = useState(
    shippingAddress.phoneNumber || ""
  );
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ""
  );
  const [deliveryMsg, setDeliveryMsg] = useState(
    shippingAddress.deliveryMsg || ""
  );
  useEffect(() => {
    if (!userInfo) {
      navigate("/signin?redirect=/shipping");
    }
  }, [userInfo, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (!isPhoneNumberValid) {
      toast.error("휴대폰번호를 확인하세요");
      return;
    }
    ctxDispatch({
      type: "SAVE_SHIPPING_ADDRESS",
      payload: {
        fullName,
        address,
        detailAddress,
        phoneNumber,
        postalCode,
        deliveryMsg,
      },
    });
    localStorage.setItem(
      "shippingAddress",
      JSON.stringify({
        fullName,
        address,
        detailAddress,
        phoneNumber,
        postalCode,
        deliveryMsg,
      })
    );
    navigate("/payment");
  };

  useEffect(() => {
    ctxDispatch({ type: "SET_FULLBOX_OFF" });
  }, [ctxDispatch, fullBox]);

  const onComplete = (data) => {
    setAddress(data.address);
    setPostalCode(data.zonecode);
    setAddressPopup(false);
  };
  const setPhoneNumberHandler = (inputPhoneNumber) => {
    // Remove any non-numeric characters from the input
    const numericPhoneNumber = inputPhoneNumber.replace(/\D/g, "");

    if (numericPhoneNumber.length === 11) {
      // If the phone number has a length of 11, format it as "010-$2-$3"
      const formattedPhoneNumber = numericPhoneNumber.replace(
        /(\d{3})(\d{4})(\d{4})/,
        "010-$2-$3"
      );
      setIsPhoneNumberValid(true);
      setPhoneNumber(formattedPhoneNumber);
    } else {
      setIsPhoneNumberValid(false);
      setPhoneNumber(inputPhoneNumber); // Set the unformatted input
    }
  };
  return (
    <div>
      <Helmet>
        <title>Shipping Address</title>
      </Helmet>

      <CheckoutSteps step1 step2></CheckoutSteps>
      <div className="container small-container">
        <h1 className="my-3">Shipping Address</h1>
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="fullName">
            <Form.Label>배송자명</Form.Label>
            <Form.Control
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="phoneNumber">
            <Form.Label>연락처</Form.Label>
            <Form.Control
              value={phoneNumber}
              onChange={(e) => setPhoneNumberHandler(e.target.value)}
              required
            />
            {!isPhoneNumberValid && (
              <div className="text-danger">휴대폰번호를 확인하세요</div>
            )}
          </Form.Group>
          <Form.Group className="mb-3" controlId="address">
            <Form.Label>주소</Form.Label>
            <Form.Control
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />

            <Button
              id="chooseAddress"
              type="button"
              variant="light"
              onClick={() => {
                setAddressPopup(true);
              }}
            >
              주소검색
            </Button>
            {addressPopup ? (
              <div>
                <DaumPostcode onComplete={onComplete}></DaumPostcode>
              </div>
            ) : null}
          </Form.Group>
          <Form.Group className="mb-3" controlId="detailAddress">
            <Form.Label>상세주소</Form.Label>
            <Form.Control
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="우편번호">
            <Form.Label>우편번호</Form.Label>
            <Form.Control
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
            <Button
              id="choosePostalcode"
              type="button"
              variant="light"
              onClick={() => navigate("/map")}
            ></Button>
          </Form.Group>
          <Form.Group className="mb-3" controlId="deliveryMsg">
            <Form.Label>배송메세지</Form.Label>
            <Form.Control
              value={deliveryMsg}
              onChange={(e) => setDeliveryMsg(e.target.value)}
            />
          </Form.Group>

          <div className="mb-3">
            <Button variant="success" type="submit">
              계속하기
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
