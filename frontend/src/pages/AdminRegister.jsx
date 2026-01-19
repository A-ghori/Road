import React, { useState } from "react";
import "../styles/adminRegister.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminRegister = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const Name = e.target.name.value;
    const Email = e.target.email.value;
    const Password = e.target.password.value;
    const Phone = e.target.phone.value;
    const Role = e.target.role.value;

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/admin/register",
        {
          name: Name,
          email: Email,
          password: Password,
          phone: Phone,
          role: Role,
        },
        { withCredentials: true },
      );

      setMessage(response.data.message || "Registration Successful");

      if (response.data.success) {
        navigate("/admin/login");
      }
    } catch (error) {
      console.log(error);
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage("An error occurred");
      }
    }
  };

  return (
    <div className="admin-register">
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" required />
        <input type="email" name="email" placeholder="Email" required />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <input type="text" name="phone" placeholder="Phone" />
        <input type="text" name="role" placeholder="Role" />

        <button type="submit">Register</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default AdminRegister;
