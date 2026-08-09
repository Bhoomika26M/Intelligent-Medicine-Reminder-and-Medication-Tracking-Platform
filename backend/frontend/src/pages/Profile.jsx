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

      console.log("PROFILE:", data);

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

      if (err.response) {
        alert(JSON.stringify(err.response.data));
      } else {
        alert("Profile update failed.");
      }
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8">

      <div className="flex flex-col items-center">

       <div className="w-28 h-28 rounded-full bg-purple-600 text-white flex items-center justify-center text-5xl font-bold">
         {(profile.first_name || "P").charAt(0).toUpperCase()}
        </div>

       <h1 className="text-3xl font-bold mt-4 text-purple-900">
        {profile.first_name && profile.last_name
          ? `${profile.first_name} ${profile.last_name}`
          : "Pranathi Pogakula"}
       </h1>

        <p className="text-gray-500 font-medium">
          @{profile.username || "pranathi64"}
        </p>

      </div>

        <div className="grid md:grid-cols-2 gap-5 mt-10">

          <div>
            <label className="font-semibold">First Name</label>

            <input
              type="text"
              name="first_name"
              value={profile.first_name}
              onChange={handleChange}
              disabled={!editing}
              className="w-full border rounded-xl p-3 mt-2"
            />
          </div>

          <div>
            <label className="font-semibold">Last Name</label>

            <input
              type="text"
              name="last_name"
              value={profile.last_name}
              onChange={handleChange}
              disabled={!editing}
              className="w-full border rounded-xl p-3 mt-2"
            />
          </div>

          <div>
            <label className="font-semibold">Username</label>

            <input
              type="text"
              name="username"
              value={profile.username}
              onChange={handleChange}
              disabled={!editing}
              className="w-full border rounded-xl p-3 mt-2"
            />
          </div>
          <div>
            <label className="font-semibold">Email</label>

            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full border rounded-xl p-3 mt-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="font-semibold">Phone Number</label>

            <input
              type="text"
              name="phone_number"
              value={profile.phone_number}
              onChange={handleChange}
              disabled={!editing}
              className="w-full border rounded-xl p-3 mt-2"
            />
          </div>

          <div>
            <label className="font-semibold">Role</label>

            <input
              type="text"
              value={profile.role || "PATIENT"}
              disabled
              className="w-full border rounded-xl p-3 mt-2 bg-gray-100 cursor-not-allowed"
            />
          </div>

        </div>

        <div className="flex justify-center gap-5 mt-10">

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={saveProfile}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition"
            >
              Save Profile
            </button>
          )}

          <button
            onClick={() => navigate("/change-password")}
            className="bg-pink-600 text-white px-6 py-3 rounded-xl hover:bg-pink-700 transition"
          >
            Change Password
          </button>

        </div>

      </div>
    </div>
  );
}

export default Profile;