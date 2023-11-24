import "@fortawesome/fontawesome-free/css/all.min.css";
import { useContext } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Store } from "../Store";
import MessageBox from "../components/MessageBox.js";
export default function CartScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const updateCartHandler = (item, quantity) => {
    if (item.color.selectColor.count < quantity) {
      toast.error("재고가 없습니다");
      return;
    }
    const updatedCartItems = [...cartItems];
    const existColor = updatedCartItems.find(
      (e) =>
        e._id === item._id &&
        e.color.selectColor._id &&
        item.color.selectColor._id
    );

    if (existColor) {
      ctxDispatch({
        type: "UPDATE_CART_ITEM",
        payload: {
          ...item,
          color: {
            ...item.color,
            selectColor: { ...item.color.selectColor, quantity: quantity },
          },
        },
      });
    }
  };
  const removeItemHandler = (item) => {
    ctxDispatch({
      type: "CART_REMOVE_ITEM",
      payload: item,
    });
  };

  const checkoutHandler = () => {
    navigate("/signin?redirect=/shipping");
  };

  return (
    <div>
      <Helmet>
        <title>RoseMarry</title>
      </Helmet>
      <h1>주문목록</h1>
      <Row>
        <Col md={8}>
          {cartItems.length === 0 ? (
            <MessageBox>
              카트가 비었습니다.<Link to="/">쇼핑하러 가기</Link>
            </MessageBox>
          ) : (
            <ListGroup>
              {cartItems.map((item, index) => (
                <ListGroup.Item
                  key={`${item._id}-${item.color.selectColor._id}-${index}`}
                >
                  <Row className="align-items-center">
                    <Col md={3}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="img-fluid rounded img-thumbnail"
                      ></img>{" "}
                      <Link to={`/product/${item.slug}`}>{item.name}</Link>{" "}
                    </Col>
                    <Col md={1}>{item.color.selectColor.name}</Col>
                    <Col md={3}>
                      <Button
                        onClick={() =>
                          updateCartHandler(
                            item,
                            item.color.selectColor.quantity - 1
                          )
                        }
                        variant="light"
                        disabled={item.color.selectColor.quantity === 1}
                      >
                        <i className="fas fa-minus-circle"></i>
                      </Button>{" "}
                      <span>{item.color.selectColor.quantity}</span>{" "}
                      <Button
                        variant="light"
                        onClick={() =>
                          updateCartHandler(
                            item,
                            item.color.selectColor.quantity + 1
                          )
                        }
                        disabled={
                          item.color &&
                          item.color.selectColor.quantity === item.color.count
                        }
                      >
                        <i className="fas fa-plus-circle"></i>
                      </Button>
                    </Col>
                    <Col md={3}>{item.price.toLocaleString()}원</Col>
                    <Col md={2}>
                      <Button
                        onClick={() => removeItemHandler(item)}
                        variant="light"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h3>
                    상품개수(
                    {cartItems.reduce(
                      (a, c) => a + c.color.selectColor.quantity,
                      0
                    )}
                    개) :
                    {cartItems
                      .reduce(
                        (a, c) => a + c.price * c.color.selectColor.quantity,
                        0
                      )
                      .toLocaleString()}
                    원
                  </h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      variant="success"
                      onClick={checkoutHandler}
                      disabled={cartItems.length === 0}
                      style={{ borderColor: "black" }}
                    >
                      계속하기
                    </Button>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
