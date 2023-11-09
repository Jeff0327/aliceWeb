import axios from "axios";
import React, { useContext, useEffect, useReducer, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Store } from "../Store";
import { colors } from "../color";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { getError } from "../utils";
const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true };
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false };
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false };
    case "UPLOAD_REQUEST":
      return { ...state, loadingUpload: true, errorUpload: "" };
    case "UPLOAD_SUCCESS":
      return {
        ...state,
        loadingUpload: false,
        errorUpload: "",
      };
    case "UPLOAD_FAIL":
      return { ...state, loadingUpload: false, errorUpload: action.payload };

    default:
      return state;
  }
};
export default function ProductEditScreen() {
  const navigate = useNavigate();
  const params = useParams(); // /product/:id
  const { id: productId } = params;

  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: "",
    });

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [images, setImages] = useState([]);
  const [detailImages, setDetailImages] = useState([]);
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(
    [...colors].map((color) => ({ ...color, count: "" }))
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/products/${productId}`);
        setName(data.name);
        setSlug(data.slug);
        setPrice(data.price);
        setImage(data.image);
        setImages(data.images);
        setDetailImages(data.detailImages);
        setCategory(data.category);
        setBrand(data.brand);
        setDescription(data.description);

        const updatedColors = colors.map((color) => ({
          ...color,
          count:
            data.color.find((c) => c.name === color.name)?.count ||
            color.count ||
            "",
        }));
        setColor(updatedColors);
        dispatch({ type: "FETCH_SUCCESS" });
      } catch (err) {
        dispatch({
          type: "FETCH_FAIL",
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, [productId]);

  const submitHandler = async (e) => {
    e.preventDefault();
    const checkboxHandler = colors.some((c) => c.check);
    if (!checkboxHandler) {
      toast.error("색상을 선택해주세요");
      return;
    }
    try {
      dispatch({ type: "UPDATE_REQUEST" });
      await axios.put(
        `/api/products/${productId}`,
        {
          _id: productId,
          name,
          slug,
          price,
          image,
          images,
          detailImages,
          category,
          brand,
          description,
          color,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({
        type: "UPDATE_SUCCESS",
      });
      toast.success("상품이 업데이트 되었습니다.");
      navigate("/admin/products");
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: "UPDATE_FAIL" });
    }
  };
  const uploadFileHandler = async (e, forImages) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append("file", file);

    try {
      dispatch({ type: "UPLOAD_REQUEST" });
      const { data } = await axios.post("/api/upload", bodyFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch({ type: "UPLOAD_SUCCESS" });

      if (forImages) {
        setImages([...images, data.secure_url]);
      } else {
        setImage(data.secure_url);
      }
      toast.success(
        "이미지가 성공적으로 업로드되었습니다. 업데이트를 클릭하여 적용하세요"
      );
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: "UPLOAD_FAIL", payload: getError(err) });
    }
  };

  const uploadDetailImagesHandler = async (e, forDetailImages) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append("file", file);

    try {
      dispatch({ type: "UPLOAD_REQUEST" });
      const { data } = await axios.post("/api/upload", bodyFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch({ type: "UPLOAD_SUCCESS" });

      if (forDetailImages) {
        setDetailImages([...detailImages, data.secure_url]);
      } else {
        setDetailImages(data.secure_url);
      }
      toast.success(
        "이미지가 성공적으로 업로드되었습니다. 업데이트를 클릭하여 적용하세요"
      );
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: "UPLOAD_FAIL", payload: getError(err) });
    }
  };
  const deleteFileHandler = async (fileName) => {
    setImages(images.filter((x) => x !== fileName));
    toast.success("이미지가 제거되었습니다. 업데이트를 클릭하여 적용하세요.");
  };
  const deleteDetailImagesHandler = async (fileName) => {
    setDetailImages(detailImages.filter((x) => x !== fileName));
    toast.success("이미지가 제거되었습니다. 업데이트를 클릭하여 적용하세요.");
  };

  return (
    <Container className="container">
      <Helmet>
        <title>RoseMarry</title>
      </Helmet>
      <h1>상품수정{productId}</h1>

      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>제품명</Form.Label>
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="slug">
            <Form.Label>제품특징</Form.Label>
            <Form.Control
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="price">
            <Form.Label>가격</Form.Label>
            <Form.Control
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>색상</Form.Label>
            <div className="row">
              {colors.map((c, index) => (
                <div
                  key={index}
                  className="col-md-3 mb-2"
                  style={{
                    flexDirection: "row",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Form.Check
                    type="checkbox"
                    key={c.name}
                    id={c.value}
                    label={c.name}
                    value={c.check}
                    checked={c.check}
                    onChange={(e) => {
                      const updatedColors = colors.map((colorObj) => {
                        if (colorObj.value === c.value) {
                          colorObj.check = e.target.checked;
                        }
                        return colorObj;
                      });
                      setColor(updatedColors);
                    }}
                  />

                  <Button
                    key={c.value}
                    style={{ background: c.value, borderColor: "black" }}
                    disabled={true}
                  ></Button>
                </div>
              ))}
            </div>
          </Form.Group>
          {colors.map(
            (c, index) =>
              c.check === true && (
                <div key={index}>
                  <Form.Group className="mb-3">
                    <Form.Label>{`${c.name} 재고수량`}</Form.Label>
                    <Form.Control
                      value={c.count || ""}
                      onChange={(e) => {
                        const updatedColors = colors.map((colorObj) => {
                          if (colorObj.value === c.value) {
                            colorObj.count = parseInt(e.target.value, 10) || "";
                          }
                          return colorObj;
                        });
                        setColor(updatedColors);
                      }}
                      required
                    />
                  </Form.Group>
                </div>
              )
          )}
          <Form.Group className="mb-3" controlId="image">
            <Form.Label>선택한파일</Form.Label>
            {/*메인 이미지선택파일*/}
            <Form.Control
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="imageFile">
            <Form.Label>메인이미지 업로드</Form.Label>
            <Form.Control type="file" onChange={uploadFileHandler} />
            {loadingUpload && <LoadingBox></LoadingBox>}
          </Form.Group>

          <Form.Group className="mb-3" controlId="additionalImage">
            <Form.Label>선택한파일</Form.Label> {/*색상별 이미지선택파일*/}
            {images.length === 0 && <MessageBox>No image</MessageBox>}
            <ListGroup variant="flush">
              {images.map((x) => (
                <ListGroup.Item key={x}>
                  {x}
                  <Button variant="light" onClick={() => deleteFileHandler(x)}>
                    <i className="fa fa-times-circle"></i>
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Form.Group>
          <Form.Group className="mb-3" controlId="additionalImageFile">
            <Form.Label>색상이미지 업로드</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => uploadFileHandler(e, true)}
            />
            {loadingUpload && <LoadingBox></LoadingBox>}
          </Form.Group>
          <Form.Group className="mb-3" controlId="detailImage">
            <Form.Label>선택한 파일</Form.Label>
            {/*상세페이지 이미지선택파일*/}
            {detailImages.length === 0 && (
              <MessageBox>No Detail image</MessageBox>
            )}
            <ListGroup variant="flush">
              {detailImages.map((x) => (
                <ListGroup.Item key={x}>
                  {x}
                  <Button
                    variant="light"
                    onClick={() => deleteDetailImagesHandler(x)}
                  >
                    <i className="fa fa-times-circle"></i>
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Form.Group>
          <Form.Group className="mb-3" controlId="detailImageFile">
            <Form.Label>상세이미지 업로드</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => uploadDetailImagesHandler(e, true)}
            />
            {loadingUpload && <LoadingBox></LoadingBox>}
          </Form.Group>
          <Form.Group className="mb-3" controlId="category">
            <Form.Label>카테고리</Form.Label>
            <Form.Control
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="brand">
            <Form.Label>브랜드</Form.Label>
            <Form.Control
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="description">
            <Form.Label>제품설명</Form.Label>
            <Form.Control
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>
          <div className="mb-3">
            <Button disabled={loadingUpdate} type="submit">
              Update
            </Button>
            {loadingUpdate && <LoadingBox></LoadingBox>}
          </div>
        </Form>
      )}
    </Container>
  );
}
