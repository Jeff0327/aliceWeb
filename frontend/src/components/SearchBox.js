import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import { useNavigate } from "react-router-dom";
export default function SearchBox() {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const submitHandler = (e) => {
    e.preventDefault();
    navigate(query ? `/search?query=${query}` : `search`);
  };
  const buttonStyle = {
    borderColor: "black",
    backgroundColor: isHovered ? "black" : "white",
  };
  return (
    <Form className="search-bar" onSubmit={submitHandler}>
      <InputGroup>
        <FormControl
          type="text"
          name="q"
          id="q"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색"
          aria-label="Search Products"
          aria-describedby="button-search"
        ></FormControl>
        <Button
          variant="outline-primary"
          type="submit"
          id="button-search"
          style={buttonStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <i className="fas fa-search"></i>
        </Button>
      </InputGroup>
    </Form>
  );
}
