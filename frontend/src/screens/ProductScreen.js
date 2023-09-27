import axios from "axios";
import { useContext, useEffect, useReducer, useRef, useState } from "react";
import AnchorLink from "react-anchor-link-smooth-scroll";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Store } from "../Store";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import Rating from "../components/Rating";
import { getError } from "../utils";
const reducer = (state, action) => {
  switch (action.type) {
    case "REFRESH_PRODUCT":
      return { ...state, product: action.payload };
    case "CREATE_REQUEST":
      return { ...state, loadingCreateReview: true };
    case "CREATE_SUCCESS":
      return { ...state, loadingCreateReview: false };
    case "CREATE_FAIL":
      return { ...state, loadingCreateReview: false };
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, product: action.payload, loading: false };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function ProductScreen() {
  let reviewsRef = useRef();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const navigate = useNavigate();
  const params = useParams();
  const { slug } = params;

  const [{ loading, error, product, loadingCreateReview }, dispatch] =
    useReducer(reducer, {
      product: [],
      loading: true,
      error: "",
    });
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const result = await axios.get(`/api/products/slug/${slug}`);
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, [slug]);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;
  const addToCartHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert("죄송합니다 상품이 매진되었습니다.");
      return;
    }
    ctxDispatch({
      type: "CART_ADD_ITEM",
      payload: { ...product, quantity },
    });
    navigate("/cart");
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!comment || !rating) {
      toast.error("댓글 & 평점을 남겨주세요.");
      return;
    }
    try {
      dispatch({ type: "CREATE_REQUEST" });
      const { data } = await axios.post(
        `/api/products/${product._id}/reviews`,
        {
          rating,
          comment,
          name: userInfo.name,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "CREATE_SUCCESS" });
      toast.success("리뷰가 입력되었습니다.");
      product.reviews.unshift(data.review);
      product.numReviews = data.numReviews;
      product.rating = data.rating;
      dispatch({ type: "REFRESH_PRODUCT", payload: product });
      window.scrollTo({
        behavior: "smooth",
        top: reviewsRef.current.offsetTop,
      });
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: "CREATE_FAIL" });
    }
  };
  return loading ? (
    <div>Loading...</div>
  ) : error ? (
    <div>{error}</div>
  ) : (
    <div>
      <Row>
        <Col md={6}>
          <img
            className="img-large"
            src={selectedImage || product.image}
            alt={product.name}
          ></img>
        </Col>

        <Col md={3}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <Helmet>
                <title>{product.name}</title>
              </Helmet>
              <h1>{product.name}</h1>
            </ListGroup.Item>
            <ListGroup.Item>
              <Rating
                rating={product.rating}
                numReviews={product.numReviews}
              ></Rating>
            </ListGroup.Item>
            <ListGroup.Item>
              상품가격:{product.price.toLocaleString()}원
            </ListGroup.Item>
            <ListGroup.Item>
              <Row
                xs={1}
                md={2}
                className="g-2
              "
              >
                {[product.image, ...product.images].map((x) => (
                  <Col key={x}>
                    <Card>
                      <Button
                        className="thumbnail"
                        type="button"
                        variant="light"
                        onClick={() => setSelectedImage(x)}
                      >
                        <Card.Img variant="top" src={x} alt="product" />
                      </Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              상품설명:
              <p>{product.description}</p>
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>상품가격:</Col>
                    <Col>{product.price.toLocaleString()}원</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>상태:</Col>
                    <Col>
                      {product.countInStock > 0 ? (
                        <Badge bg="success">판매중</Badge>
                      ) : (
                        <Badge bg="danger">Sold out</Badge>
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>

                {product.countInStock > 0 && (
                  <ListGroup.Item>
                    <div className="d-grid">
                      <Button onClick={addToCartHandler} variant="primary">
                        카트에 담기
                      </Button>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div style={{ display: "flex" }}>
        <ul className="contents-section-ul">
          <AnchorLink href="#details" className="contents-section-link">
            <li>상세정보</li>
          </AnchorLink>
          <AnchorLink href="#reviews" className="contents-section-link">
            <li>상품평/리뷰</li>
          </AnchorLink>
          <AnchorLink href="#inquire" className="contents-section-link">
            <li>상품문의</li>
          </AnchorLink>
          <AnchorLink href="#delivery" className="contents-section-link">
            <li>배송/교환</li>
          </AnchorLink>
        </ul>
      </div>
      <div id="details" className="detail-product">
        <div className="detail-wrap">
          {product.detailImages.map((e, index) => (
            <img
              key={index}
              src={e}
              className="detail-images"
              alt={`detailImage-${index}`}
            />
          ))}
        </div>
      </div>

      <div id="reviews" className="my-3">
        <h2 ref={reviewsRef}>리뷰</h2>
        <div className="mb-3">
          {product.reviews.length === 0 && (
            <MessageBox>리뷰가 없습니다.</MessageBox>
          )}
        </div>
        <ListGroup>
          {product.reviews.map((review) => (
            <ListGroup.Item key={review._id}>
              <strong>{review.name}</strong>
              <Rating rating={review.rating} caption=" "></Rating>
              <p>{review.createdAt.substring(0, 10)}</p>
              <p>{review.comment}</p>
            </ListGroup.Item>
          ))}
        </ListGroup>
        <div className="my-3">
          {userInfo ? (
            <form onSubmit={submitHandler}>
              <h2>리뷰 작성</h2>
              <Form.Group className="mb-3" controlId="rating">
                <Form.Select
                  aria-label="평가"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value="">선택</option>
                  <option value="1">⭑</option>
                  <option value="2">⭑⭑</option>
                  <option value="3">⭑⭑⭑</option>
                  <option value="4">⭑⭑⭑⭑</option>
                  <option value="5">⭑⭑⭑⭑⭑</option>
                </Form.Select>
              </Form.Group>
              <FloatingLabel
                controlId="floatingTextarea"
                label="댓글"
                className="mb-3"
              >
                <Form.Control
                  as="textarea"
                  placeholder="여기에 댓글을 남겨주세요"
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                  }}
                />
              </FloatingLabel>
              <div className="mb-3">
                <Button disabled={loadingCreateReview} type="submit">
                  댓글달기
                </Button>
                {loadingCreateReview && <LoadingBox></LoadingBox>}
              </div>
            </form>
          ) : (
            <MessageBox>
              {" "}
              <Link to={`/signin?redirect=/product/${product.slug}`}>
                로그인
              </Link>{" "}
              리뷰를 작성해주세요
            </MessageBox>
          )}
        </div>
      </div>
      <div id="inquire" className="my-3">
        <h3>문의사항</h3>
        <h4>아래하단참조</h4>
        <p>평일 09:00~16:00</p>
      </div>
      <div id="delivery" className="my-3">
        <p>배송</p>
        {/* <div style={{ flexdirection: "row", justifyContent: "space-around" }}>
          <img
            alt="delivery"
            style={{ width: 50, height: 50, color: "none" }}
            src={`${process.env.PUBLIC_URL}/images/orderIcon.gif`}
          />
          <img
            alt="delivery"
            style={{ width: 50, height: 50, color: "none" }}
            src={`${process.env.PUBLIC_URL}/images/rightArrow.png`}
          />
          <img
            alt="delivery"
            style={{ width: 50, height: 50, color: "none" }}
            src={`${process.env.PUBLIC_URL}/images/orderIcon.gif`}
          />
          <img
            alt="delivery"
            style={{ width: 50, height: 50, color: "none" }}
            src={`${process.env.PUBLIC_URL}/images/rightArrow.png`}
          />
          <img
            alt="delivery"
            style={{ width: 50, height: 50, color: "none" }}
            src={`${process.env.PUBLIC_URL}/images/orderIcon.gif`}
          />
          <img
            alt="delivery"
            style={{ width: 50, height: 50, color: "none" }}
            src={`${process.env.PUBLIC_URL}/images/rightArrow.png`}
          />
          <img
            alt="delivery"
            style={{ width: 50, height: 50, color: "none" }}
            src={`${process.env.PUBLIC_URL}/images/prize.png`}
          />
        </div> */}
        <ul>
          주문일로부터 평균 7일이내에 배송되지만 주문량이 많을 경우 배송지연이
          될 수 있습니다.
        </ul>
      </div>
    </div>
  );
}
