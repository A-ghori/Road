import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminRegister from "./pages/AdminRegister";
import AdminLogin from "./pages/AdminLogin";
import UserRegister from "./pages/userRegister";
import UserLogin from "./pages/userLogin";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import LiveMap from "./pages/LiveMap";
function App() {
  return (
<BrowserRouter>
      <Routes>
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/user/register" element={<UserRegister />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/map" element={<LiveMap/>} />
      </Routes>
    </BrowserRouter>
      
  );
}

export default App;
