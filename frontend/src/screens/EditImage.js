import axios from "axios";
import React, { useContext, useEffect, useReducer, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Store } from "../Store";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, product: action.payload };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function EditImage() {
  const [{ loading, error, product }, dispatch] = useReducer(reducer, {
    product: {},
    loading: true,
    error: "",
  });
  const { state, dispatch: ctxDispatch } = useContext(Store);

  const [selectedImage, setSelectedImage] = useState(null);

  // Define the fetchData function at the top level
  const fetchData = async () => {
    dispatch({ type: "FETCH_REQUEST" });
    try {
      const response = await axios.get(`/api/products/`);
      dispatch({ type: "FETCH_SUCCESS", payload: response.data });
    } catch (error) {
      dispatch({ type: "FETCH_FAIL", payload: error.message });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageChange = (event) => {
    setSelectedImage(event.target.files[0]);
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      console.error("No image selected.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedImage);

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("File uploaded successfully:", response.data);

      // Show a success message to the user
      alert("File uploaded successfully!");

      // Clear the selected image input field
      setSelectedImage(null);

      // Update the UI with the new image or products if needed
      fetchData();
    } catch (error) {
      console.error("Error uploading file:", error);

      alert("Failed to upload file. Please try again.");
    }
  };

  return (
    <div>
      <Helmet>
        <title>Alice</title>
      </Helmet>
      <div>
        <pre>
          {" "}
          {Array.isArray(product) &&
            product.map((val, key) => (
              <div key={key}>
                {val.name}
                <br />
                <img
                  className="img-small"
                  alt={val.name}
                  src={`/upload/${val.image}`}
                ></img>
                {val.image}
                <input type="file" onChange={handleImageChange} />
                <button onClick={uploadImage}>Upload</button>
              </div>
            ))}
        </pre>
      </div>
    </div>
  );
}
