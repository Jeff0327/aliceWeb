import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import Rating from "./Rating";

export default function Product(props) {
  const { product } = props;

  return (
    <div className="card-div">
      <Card className="cardContainer">
        <Link to={`/product/${product.slug}`}>
          <div className="cardImageContainer">
            <img
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
            <Card.Title className="productName">
              {product.name.length > 25
                ? product.name.slice(0, 25)
                : product.name}
            </Card.Title>
          </Link>
          <Rating rating={product.rating} numReviews={product.numReviews} />
          <Card.Text>{product.price.toLocaleString()}원</Card.Text>
        </Card.Body>
      </Card>
    </div>
  );
}
