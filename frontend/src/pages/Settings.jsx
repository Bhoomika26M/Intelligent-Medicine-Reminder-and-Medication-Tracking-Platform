import { useEffect, useState } from "react";

function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminderNotifications, setReminderNotifications] = useState(true);
  const [medicineAlerts, setMedicineAlerts] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const API_URL = "http://127.0.0.1:8000/api";

  // ==========================================
  // LOAD SETTINGS FROM BACKEND
  // ==========================================

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/users/settings/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load settings");
      }

      const data = await response.json();

      setEmailNotifications(
        data.email_notifications ?? true
      );

      setReminderNotifications(
        data.medicine_reminders ?? true
      );

      setMedicineAlerts(
        data.medicine_alerts ?? true
      );

    } catch (error) {
      console.error("Error loading settings:", error);

      // Fallback to localStorage
      const savedSettings =
        localStorage.getItem("settings");

      if (savedSettings) {
        const data = JSON.parse(savedSettings);

        setEmailNotifications(
          data.emailNotifications ?? true
        );

        setReminderNotifications(
          data.reminderNotifications ?? true
        );

        setMedicineAlerts(
          data.medicineAlerts ?? true
        );
      }

    } finally {
      setLoading(false);
    }
  };


  // ==========================================
  // SAVE SETTINGS TO BACKEND
  // ==========================================

  const handleSave = async () => {
    setSaving(true);

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/users/settings/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            email_notifications: emailNotifications,
            medicine_reminders: reminderNotifications,
            medicine_alerts: medicineAlerts,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      // Also save locally
      localStorage.setItem(
        "settings",
        JSON.stringify({
          emailNotifications,
          reminderNotifications,
          medicineAlerts,
        })
      );

      alert("Settings saved successfully!");

    } catch (error) {
      console.error("Error saving settings:", error);

      // Save locally if backend is unavailable
      localStorage.setItem(
        "settings",
        JSON.stringify({
          emailNotifications,
          reminderNotifications,
          medicineAlerts,
        })
      );

      alert(
        "Settings saved locally. Backend settings could not be updated."
      );

    } finally {
      setSaving(false);
    }
  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1218] text-white flex items-center justify-center">
        <p className="text-gray-400">
          Loading settings...
        </p>
      </div>
    );
  }


  // ==========================================
  // TOGGLE COMPONENT
  // ==========================================

  const Toggle = ({ enabled, onClick }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-14 h-7 rounded-full transition-all duration-300 ${
          enabled
            ? "bg-[#00C2A8]"
            : "bg-gray-600"
        }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
            enabled
              ? "translate-x-7"
              : "translate-x-1"
          }`}
        />
      </button>
    );
  };


  return (
    <div className="min-h-screen bg-[#0f1218] text-white px-8 py-10">

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="mb-10">

        <p className="text-[#00C2A8] text-sm font-semibold uppercase tracking-widest">
          Preferences
        </p>

        <h1 className="text-4xl font-bold mt-2">
          Settings
        </h1>

        <p className="text-gray-400 mt-2">
          Manage your notification and medication preferences.
        </p>

      </div>


      {/* ===================================== */}
      {/* SETTINGS CARD */}
      {/* ===================================== */}

      <div className="max-w-4xl">

        <div className="bg-[#151922] border border-gray-800 rounded-2xl p-7 mb-6">


          {/* SECTION HEADER */}

          <div className="flex items-center gap-3 mb-6">

            <div className="w-10 h-10 rounded-xl bg-[#00C2A8]/15 flex items-center justify-center text-[#00C2A8] text-xl">

              ⚙

            </div>

            <div>

              <h2 className="text-xl font-semibold">
                Notification Settings
              </h2>

              <p className="text-gray-400 text-sm">
                Control how PillSync sends medication notifications.
              </p>

            </div>

          </div>


          {/* ================================= */}
          {/* EMAIL NOTIFICATIONS */}
          {/* ================================= */}

          <div className="flex items-center justify-between py-5 border-b border-gray-800">

            <div>

              <h3 className="font-medium">
                Email Notifications
              </h3>

              <p className="text-gray-400 text-sm mt-1">
                Receive medication reminders through email.
              </p>

            </div>

            <Toggle
              enabled={emailNotifications}
              onClick={() =>
                setEmailNotifications(
                  !emailNotifications
                )
              }
            />

          </div>


          {/* ================================= */}
          {/* MEDICINE REMINDERS */}
          {/* ================================= */}

          <div className="flex items-center justify-between py-5 border-b border-gray-800">

            <div>

              <h3 className="font-medium">
                Medicine Reminders
              </h3>

              <p className="text-gray-400 text-sm mt-1">
                Get notified when it is time to take your medicine.
              </p>

            </div>

            <Toggle
              enabled={reminderNotifications}
              onClick={() =>
                setReminderNotifications(
                  !reminderNotifications
                )
              }
            />

          </div>


          {/* ================================= */}
          {/* MEDICINE ALERTS */}
          {/* ================================= */}

          <div className="flex items-center justify-between py-5">

            <div>

              <h3 className="font-medium">
                Medicine Alerts
              </h3>

              <p className="text-gray-400 text-sm mt-1">
                Receive alerts when medicine stock is running low.
              </p>

            </div>

            <Toggle
              enabled={medicineAlerts}
              onClick={() =>
                setMedicineAlerts(
                  !medicineAlerts
                )
              }
            />

          </div>

        </div>


        {/* ===================================== */}
        {/* CURRENT STATUS */}
        {/* ===================================== */}

        <div className="bg-[#151922] border border-gray-800 rounded-2xl p-6 mb-6">

          <h2 className="text-lg font-semibold mb-4">
            Current Notification Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="bg-[#0f1218] rounded-xl p-4">

              <p className="text-gray-400 text-sm">
                Email
              </p>

              <p
                className={`mt-1 font-semibold ${
                  emailNotifications
                    ? "text-[#00C2A8]"
                    : "text-red-400"
                }`}
              >
                {emailNotifications
                  ? "Enabled"
                  : "Disabled"}
              </p>

            </div>


            <div className="bg-[#0f1218] rounded-xl p-4">

              <p className="text-gray-400 text-sm">
                Reminders
              </p>

              <p
                className={`mt-1 font-semibold ${
                  reminderNotifications
                    ? "text-[#00C2A8]"
                    : "text-red-400"
                }`}
              >
                {reminderNotifications
                  ? "Enabled"
                  : "Disabled"}
              </p>

            </div>


            <div className="bg-[#0f1218] rounded-xl p-4">

              <p className="text-gray-400 text-sm">
                Medicine Alerts
              </p>

              <p
                className={`mt-1 font-semibold ${
                  medicineAlerts
                    ? "text-[#00C2A8]"
                    : "text-red-400"
                }`}
              >
                {medicineAlerts
                  ? "Enabled"
                  : "Disabled"}
              </p>

            </div>

          </div>

        </div>


        {/* ===================================== */}
        {/* SAVE BUTTON */}
        {/* ===================================== */}

        <div className="flex justify-end">

          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
              saving
                ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                : "bg-[#00C2A8] text-black hover:bg-[#00ad97]"
            }`}
          >
            {saving
              ? "Saving..."
              : "Save Settings"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default Settings;