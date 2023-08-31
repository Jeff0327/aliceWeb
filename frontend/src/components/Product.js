import axios from "axios";
import { useContext } from "react";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import { Store } from "../Store";
import Rating from "./Rating";

function Product(props) {
  const { product } = props;

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const addToCartHandler = async (item) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert("죄송합니다 상품이 매진되었습니다.");
      return;
    }
    ctxDispatch({
      type: "CART_ADD_ITEM",
      payload: { ...item, quantity },
    });
  };

  return (
    <Card className="cardContainer">
      <Link to={`/product/${product.slug}`}>
        <div style={{ height: "300px", overflow: "hidden" }}>
          <img
            src={product.image}
            className="card-img-top"
            alt={product.name}
          />
        </div>
      </Link>

      <Card.Body>
        <Link to={`/product/${product.slug}`}>
          <Card.Title>{product.name}</Card.Title>
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <Card.Text>{product.price.toLocaleString()}원</Card.Text>
      </Card.Body>
    </Card>
  );
}
export default Product;
