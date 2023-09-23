import axios from "axios";
import { useEffect, useReducer } from "react";
import Carousel from "react-bootstrap/Carousel";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox.js";
import Product from "../components/Product";
const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, products: action.payload, loading: false };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function HomeScreen() {
  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const result = await axios.get("/api/products");
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: err.message });
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <Helmet>
        <title>RoseMarry</title>
      </Helmet>
      <div className="event-container">
        <Carousel interval={4000} pause="hover" className="custom-carousel">
          {products.map(
            (product) =>
              product.category === "이벤트" && (
                <Carousel.Item key={product._id}>
                  <Row
                    style={{
                      maxHeight: "500px", // Center the images vertically
                    }}
                  >
                    {product.images.slice(0, 3).map((image, index) => (
                      <Col
                        key={index}
                        style={{
                          alignContent: "space-between",
                          justifyContent: "space-between",
                        }}
                      >
                        <img
                          style={{
                            width: "415px",
                            height: "500px",
                            overflow: "auto",
                          }}
                          src={`${process.env.PUBLIC_URL}${image}`}
                          alt={`Event: ${product.name}`}
                        />
                      </Col>
                    ))}
                  </Row>
                </Carousel.Item>
              )
          )}
        </Carousel>
      </div>
      <div className="products">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Row>
            {products.map((product) => (
              <Col key={product.slug} xs={6} lg={3} className="mb-3">
                <Product product={product}></Product>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
