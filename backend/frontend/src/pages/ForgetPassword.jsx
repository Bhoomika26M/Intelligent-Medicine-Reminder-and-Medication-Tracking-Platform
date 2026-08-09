import { Link } from "react-router-dom";

function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700 px-4">

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10">

        <h1 className="text-4xl font-bold text-center text-indigo-700">
          Forgot Password
        </h1>

        <p className="text-center text-gray-600 mt-3">
          Enter your email address to receive a password reset link.
        </p>

        <form className="mt-8 space-y-6">

          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="button"
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold"
            onClick={() =>
              alert("Password reset functionality will be connected to the backend later.")
            }
          >
            Send Reset Link
          </button>

        </form>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-indigo-600 hover:underline"
          >
            Back to Login
          </Link>
        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;