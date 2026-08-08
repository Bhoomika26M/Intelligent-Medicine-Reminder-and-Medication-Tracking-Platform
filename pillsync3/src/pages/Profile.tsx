import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, Badge, Button } from "@/components/ui";
import { User as UserIcon, Mail, Shield, LogOut, Activity, Info } from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Profile</h1>
        <p className="text-ink-500 mt-1">Your account information.</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink-900">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              {user.is_guest ? <Badge tone="warning">Guest</Badge> : <Badge tone="success">Registered</Badge>}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3 py-3 border-t border-slate-100">
            <UserIcon className="w-4 h-4 text-ink-500" />
            <span className="text-sm text-ink-500 w-24">Name</span>
            <span className="text-sm font-medium text-ink-900">{user.name}</span>
          </div>
          <div className="flex items-center gap-3 py-3 border-t border-slate-100">
            <Mail className="w-4 h-4 text-ink-500" />
            <span className="text-sm text-ink-500 w-24">Email</span>
            <span className="text-sm font-medium text-ink-900">{user.email || "—"}</span>
          </div>
          <div className="flex items-center gap-3 py-3 border-t border-slate-100">
            <Shield className="w-4 h-4 text-ink-500" />
            <span className="text-sm text-ink-500 w-24">Account</span>
            <span className="text-sm font-medium text-ink-900">{user.is_guest ? "Guest session" : "Registered user"}</span>
          </div>
        </div>

        <div className="mt-6">
          <Button variant="danger" onClick={handleLogout} className="w-full">
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>
      </Card>

      <Card className="p-5 bg-primary-50/40 border-primary-100">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-ink-900">About PillSync</p>
            <p className="text-sm text-ink-500 mt-1">
              PillSync is a college demonstration project for smart medication management.
              It covers medicine management, dosage scheduling, reminders, browser notifications,
              medication history, OCR label scanning, refill prediction, adherence analytics and low-stock detection.
              All data is stored locally.
            </p>
            <div className="flex items-center gap-1.5 mt-3 text-xs text-ink-500">
              <Activity className="w-3.5 h-3.5" /> Demo project · For presentation purposes only
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
