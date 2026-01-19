import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserRegister = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const phone = e.target.phone.value;
    const address = e.target.address.value;

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/user/register",
        {
          fullName: name,
          email,
          password,
          phone,
          adress: address,
        },
        {
          withCredentials: true,
        },
      );

      setMessage(response.data.message || "Registration Successful");
      navigate("/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="user-register-container">
      <h2>User Register</h2>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" required />
        <input type="email" name="email" placeholder="Email" required />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <input type="text" name="phone" placeholder="Phone" required />
        <input type="text" name="address" placeholder="Address" required />

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default UserRegister;
