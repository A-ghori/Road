import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import "./index.css";
import PotholeDetection from "./pages/PotholeDetection";


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/pothole-detection" element={<PotholeDetection />} />
      </Routes>
    </Router>
  );
}

export default App;
