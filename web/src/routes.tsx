import React from 'react';
import { Route, Routes } from 'react-router-dom';

import CreatePoint from './pages/CreatePoint';
import Home from './pages/Home';

const MainRoute: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="createpoint" element={<CreatePoint />} />
    </Routes>
  );
};

export default MainRoute;
