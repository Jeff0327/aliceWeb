import Spinner from "react-bootstrap/Spinner";

export default function LoadingBox() {
  return (
    <Spinner animation="border" role="status">
      <h1>123</h1>
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  );
}
