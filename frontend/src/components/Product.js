import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import Rating from "./Rating";

export default function Product(props) {
  const { product } = props;

  return (
    <Card className="cardContainer">
      <Link to={`/product/${product.slug}`}>
        <div style={{ height: "300px", overflow: "hidden" }}>
          <img
            http-equiv="Content-Security-Policy"
            content="img-src 'self' https://img1.kbstar.com"
            src={product.image}
            className="card-img-top"
            alt={product.name}
          />
        </div>
      </Link>

      <Card.Body>
        <Link
          style={{ textDecoration: "none", color: "black" }}
          to={`/product/${product.slug}`}
        >
          <Card.Title className="productName">{product.name}</Card.Title>
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <Card.Text>{product.price.toLocaleString()}원</Card.Text>
      </Card.Body>
    </Card>
  );
}
