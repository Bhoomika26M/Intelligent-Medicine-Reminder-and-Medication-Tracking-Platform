import { useState } from "react";
import axios from "axios";

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const response = await axios.post(
        "http://127.0.0.1:8000/api/users/change-password/",
        {
          old_password: oldPassword,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      alert("Password changed successfully!");

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.log(error);
      alert("Failed to change password.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center p-8">

      <form
        onSubmit={changePassword}
        className="w-full max-w-md bg-[#1D2330] border border-gray-700 rounded-3xl shadow-xl p-8"
      >

        <h1 className="text-3xl font-bold text-center text-white mb-2">
          Change Password
        </h1>

        <p className="text-center text-gray-400 mb-8">
          Keep your PillSync account secure
        </p>
        <input
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="w-full mb-4 p-3 rounded-xl bg-[#151922] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full mb-4 p-3 rounded-xl bg-[#151922] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full mb-6 p-3 rounded-xl bg-[#151922] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
        />

        <button
          type="submit"
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-xl font-semibold transition duration-300"
        >
          Change Password
        </button>

      </form>
    </div>
  );
}

export default ChangePassword;