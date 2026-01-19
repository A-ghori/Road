import React, { useState } from "react";
import "../styles/loginPage.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const Email = e.target.email.value;
    const Password = e.target.password.value;
    const Phone = e.target.phone.value;
    // const Role = e.target.role.value;

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/admin/login",
        {
          email: Email,
          password: Password,
          phone: Phone,
          // role: Role,
        },
        { withCredentials: true },
      );

      setMessage(response.data.message || "Login Successful");

      if (response.data.success) {
        navigate("/home");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setMessage(
          error.response.data.message ||
            "You AssHole trying to BruteforceLogin Failed",
        );
      } else {
        setMessage("Something Went Wrong");
      }
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" required />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <input type="text" name="phone" placeholder="Phone" />
        <input type="text" name="role" placeholder="Role" />

        <button type="submit">Login</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default AdminLogin;
