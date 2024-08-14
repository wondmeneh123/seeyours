import React from "react";
import { Link } from "react-router-dom";
import "./main.css";

const LandingPage = () => {
  return (
    <div className="wrapper">
      <div className="links">
        <Link to="watch">Watch</Link>
        <Link to="stream">Stream</Link>
      </div>
    </div>
  );
};

export default LandingPage;
