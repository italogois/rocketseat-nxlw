import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreatePoint from "./pages/CreatePoint";

const MainRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="createpoint" element={<CreatePoint />} />
    </Routes>
  );
};

export default MainRoute;
