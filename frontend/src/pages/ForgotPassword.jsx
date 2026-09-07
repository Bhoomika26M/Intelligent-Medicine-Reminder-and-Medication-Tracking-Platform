import { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/users/forgot-password/",
        {
          email,
        }
      );

      setMessage("Password reset link sent to your email.");
    } catch (err) {
      setMessage(
        err.response?.data?.error || "Something went wrong."
      );
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-cyan-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">

        <h2 className="text-3xl font-bold mb-6 text-center">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Enter your email"
            className="w-full border rounded-lg p-3 mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-cyan-600 text-white rounded-lg p-3"
          >
            Send Reset Link
          </button>

        </form>

        {message && (
          <p className="mt-4 text-center text-green-600">
            {message}
          </p>
        )}

      </div>
    </div>
  );
}