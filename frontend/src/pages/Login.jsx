import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, HeartPulse } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/token/",
        {
          username: form.username,
          password: form.password,
        }
      );

      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Invalid username or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-cyan-100 via-sky-200 to-indigo-300 flex items-center justify-center px-4 py-8">

      {/* Background Glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-cyan-300/40 blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-400/40 blur-3xl"></div>
      <div className="absolute top-1/3 left-1/2 w-80 h-80 rounded-full bg-sky-300/30 blur-3xl"></div>

      <div className="relative w-full max-w-6xl overflow-hidden rounded-[35px] bg-white/80 backdrop-blur-2xl border border-white/30 shadow-[0_30px_80px_rgba(37,99,235,0.25)] grid lg:grid-cols-2">

        {/* LEFT PANEL */}

        <div className="hidden lg:flex relative bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-900 overflow-hidden p-14">

          <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>

          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-cyan-300/20 blur-3xl"></div>

          <div className="relative z-10 flex flex-col justify-center text-white">

            <div className="flex items-center gap-4 mb-10">

              <div className="bg-white/20 border border-white/20 backdrop-blur-xl p-4 rounded-2xl">

                <HeartPulse size={36} />

              </div>

              <div>

                <h1 className="text-4xl font-extrabold">
                  PillSync
                </h1>

                <p className="text-cyan-100 mt-1">
                  Smart Medication Care
                </p>

              </div>

            </div>

            <h2 className="text-5xl font-bold leading-tight">
              Never Miss
              <br />
              Your Medicine
              <br />
              Again.
            </h2>

            <p className="mt-8 text-lg leading-8 text-cyan-100 max-w-md">
              Manage medicines, receive reminders, track daily doses and stay healthy with an elegant healthcare companion.
            </p>

            <div className="mt-14 space-y-6">

              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-cyan-300"></div>
                <span className="text-lg">Medicine Tracking</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-pink-300"></div>
                <span className="text-lg">Reminder Notifications</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-green-300"></div>
                <span className="text-lg">Medication History</span>
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT PANEL */}
        {/* RIGHT PANEL */}

<div className="relative flex items-center justify-center bg-white/60 backdrop-blur-xl px-8 py-12">

  <div className="w-full max-w-md">

    <div className="mb-8">

      <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-2 text-cyan-700 font-semibold">
        💙 Welcome Back
      </div>

      <h2 className="mt-5 text-4xl font-extrabold text-slate-800">
        Sign in to PillSync
      </h2>

      <p className="mt-3 text-slate-500">
        Access your medicines, reminders and medication history.
      </p>

    </div>

    {error && (
      <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">
        {error}
      </div>
    )}

    <form onSubmit={handleLogin} className="space-y-5">

      <div>

        <label className="mb-2 block font-semibold text-slate-700">
          Username
        </label>

        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Enter your username"
          required
          className="w-full rounded-2xl border border-cyan-100 bg-cyan-50/70 px-5 py-4 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200"
        />

      </div>

      <div>

        <label className="mb-2 block font-semibold text-slate-700">
          Password
        </label>

        <div className="relative">

          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            className="w-full rounded-2xl border border-cyan-100 bg-cyan-50/70 px-5 py-4 pr-14 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-600"
          >
            {showPassword ? <EyeOff size={22}/> : <Eye size={22}/>}
          </button>

        </div>

      </div>

      <div className="flex justify-end">

        <button
          type="button"
          className="text-sm font-semibold text-cyan-700 hover:text-blue-700"
        >
          Forgot Password?
        </button>

      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-600 to-indigo-700 py-4 font-bold text-white shadow-xl transition duration-300 hover:scale-[1.02]"
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>

    </form>

    <div className="relative my-7 flex items-center">

      <div className="flex-1 border-t border-slate-300"></div>

      <span className="bg-white/60 px-4 text-sm text-slate-500">
        OR
      </span>

      <div className="flex-1 border-t border-slate-300"></div>

    </div>

<GoogleLogin
  onSuccess={async (credentialResponse) => {
    try {
      console.log("Google Login Started");

      const res = await axios.post(
        "http://127.0.0.1:8000/api/users/google-login/",
        {
          token: credentialResponse.credential,
        }
      );

      console.log("Google Response:", res.data);

      // Save JWT Tokens
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      // Verify they were saved
      console.log(
        "Saved Access Token:",
        localStorage.getItem("access_token")
      );

      console.log(
        "Saved Refresh Token:",
        localStorage.getItem("refresh_token")
      );

      alert("Google Login Successful");

      navigate("/dashboard");

    } catch (error) {
      console.error("Google Login Error:", error);

      if (error.response) {
        console.log(error.response.data);
      }

      alert("Google Login Failed");
    }
  }}

  onError={() => {
    console.log("Google Sign-In Failed");
    alert("Google Sign-In Failed");
  }}
/>

    <div className="mt-8">
    <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-sky-100 p-6">

  <h3 className="text-xl font-bold text-slate-800">
    New to PillSync?
  </h3>

  <p className="mt-3 text-sm leading-6 text-slate-600">
    Join PillSync to manage your medicines, receive reminders,
    track your daily progress and stay healthier every day.
  </p>

  <Link
    to="/register"
    className="mt-6 inline-flex w-full items-center justify-center rounded-xl border-2 border-cyan-600 py-3 font-semibold text-cyan-700 transition-all duration-300 hover:bg-cyan-600 hover:text-white"
  >
    Create Account
  </Link>

</div>

</div>

</div>

</div>

{/* Floating Decorative Elements */}

<div className="hidden lg:block absolute top-16 left-20 w-6 h-6 rounded-full bg-cyan-400 animate-pulse"></div>

<div className="hidden lg:block absolute bottom-20 right-20 w-8 h-8 rounded-full bg-indigo-500 animate-bounce"></div>

<div className="hidden lg:block absolute top-1/3 right-10 w-4 h-4 rounded-full bg-pink-400 animate-ping"></div>

<div className="hidden lg:block absolute bottom-32 left-1/3 w-5 h-5 rounded-full bg-sky-400 animate-pulse"></div>
</div>
</div>
   );
}
  