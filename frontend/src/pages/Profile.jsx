import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfile,
  updateProfile,
} from "../services/profileService";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
    role: "PATIENT",
  });

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();

      setProfile({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        username: data.username || "",
        email: data.email || "",
        phone_number: data.phone_number || "",
        role: data.role || "PATIENT",
      });
    } catch (err) {
      console.log(err);
      alert("Unable to load profile.");
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const saveProfile = async () => {
    try {
      await updateProfile({
        username: profile.username,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number,
      });

      alert("Profile Updated Successfully");
      setEditing(false);
      loadProfile();
    } catch (err) {
      console.log(err);
      alert("Profile update failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1117] p-8">
      <div className="max-w-4xl mx-auto bg-[#1D2330] border border-gray-700 rounded-3xl shadow-xl p-8">

        <div className="flex flex-col items-center">

          <div className="w-32 h-32 rounded-full bg-cyan-500 flex items-center justify-center text-5xl font-bold text-white border-4 border-cyan-300">
            {(profile.first_name || "P").charAt(0).toUpperCase()}
          </div>

          <h1 className="text-3xl font-bold text-white mt-5">
            {profile.first_name && profile.last_name
              ? `${profile.first_name} ${profile.last_name}`
              : "Pranathi Pogakula"}
          </h1>

          <p className="text-cyan-400 mt-2">
            @{profile.username}
          </p>

        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-10">
          <div>
            <label className="text-cyan-400 font-semibold">
              First Name
            </label>

            <input
              type="text"
              name="first_name"
              value={profile.first_name}
              onChange={handleChange}
              disabled={!editing}
              className="w-full mt-2 p-3 rounded-xl bg-[#151922] border border-gray-600 text-white focus:border-cyan-400 outline-none disabled:opacity-70"
            />
          </div>

          <div>
            <label className="text-cyan-400 font-semibold">
              Last Name
            </label>

            <input
              type="text"
              name="last_name"
              value={profile.last_name}
              onChange={handleChange}
              disabled={!editing}
              className="w-full mt-2 p-3 rounded-xl bg-[#151922] border border-gray-600 text-white focus:border-cyan-400 outline-none disabled:opacity-70"
            />
          </div>

          <div>
            <label className="text-cyan-400 font-semibold">
              Username
            </label>

            <input
              type="text"
              name="username"
              value={profile.username}
              onChange={handleChange}
              disabled={!editing}
              className="w-full mt-2 p-3 rounded-xl bg-[#151922] border border-gray-600 text-white focus:border-cyan-400 outline-none disabled:opacity-70"
            />
          </div>

          <div>
            <label className="text-cyan-400 font-semibold">
              Email
            </label>

            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full mt-2 p-3 rounded-xl bg-[#0F1117] border border-gray-700 text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-cyan-400 font-semibold">
              Phone Number
            </label>

            <input
              type="text"
              name="phone_number"
              value={profile.phone_number}
              onChange={handleChange}
              disabled={!editing}
              className="w-full mt-2 p-3 rounded-xl bg-[#151922] border border-gray-600 text-white focus:border-cyan-400 outline-none disabled:opacity-70"
            />
          </div>

          <div>
            <label className="text-cyan-400 font-semibold">
              Role
            </label>

            <input
              type="text"
              value={profile.role}
              disabled
              className="w-full mt-2 p-3 rounded-xl bg-[#0F1117] border border-gray-700 text-gray-400 cursor-not-allowed"
            />
          </div>

        </div>

        <div className="flex justify-center gap-5 mt-10">

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-xl font-semibold transition"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={saveProfile}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition"
            >
              Save Profile
            </button>
          )}

          <button
            onClick={() => navigate("/change-password")}
            className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition"
          >
            Change Password
          </button>

        </div>

      </div>
    </div>
  );
}

export default Profile;