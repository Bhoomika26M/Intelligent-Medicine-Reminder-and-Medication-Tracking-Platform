import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
    role: "PATIENT",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {

      await axios.post(
        "http://127.0.0.1:8000/api/users/register/",
        {
          first_name: formData.first_name,
          last_name: formData.last_name,
          username: formData.username,
          email: formData.email,
          phone_number: formData.phone_number,
          password: formData.password,
          role: formData.role,
        }
      );

      alert("Registration Successful 🎉");

      navigate("/");

    } catch (error) {

      console.log(error.response?.data);

      alert("Registration Failed");

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-white p-6">

      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-lg">

        <h1 className="text-4xl font-bold text-center text-purple-800">
          Create Account
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-6">
          Join PillSync
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="first_name"
            placeholder="First Name"
            className="w-full border p-4 rounded-2xl"
            onChange={handleChange}
          />

          <input
            name="last_name"
            placeholder="Last Name"
            className="w-full border p-4 rounded-2xl"
            onChange={handleChange}
          />

          <input
            name="username"
            placeholder="Username"
            className="w-full border p-4 rounded-2xl"
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border p-4 rounded-2xl"
            onChange={handleChange}
          />

          <input
            name="phone_number"
            placeholder="Phone Number"
            className="w-full border p-4 rounded-2xl"
            onChange={handleChange}
          />

          <select
            name="role"
            className="w-full border p-4 rounded-2xl"
            onChange={handleChange}
          >
            <option value="PATIENT">Patient</option>
            <option value="CAREGIVER">Caregiver</option>
            <option value="ADMIN">Admin</option>
          </select>

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border p-4 rounded-2xl"
            onChange={handleChange}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full border p-4 rounded-2xl"
            onChange={handleChange}
          />

          <button
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold"
          >
            Register
          </button>

        </form>

        <p className="text-center mt-5">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-purple-700 font-bold"
          >
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Register;