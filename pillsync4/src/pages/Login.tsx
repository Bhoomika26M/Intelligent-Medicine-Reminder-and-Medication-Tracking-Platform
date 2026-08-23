import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button, Input, Label } from "@/components/ui";
import { Activity, Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";

export default function Login() {
  const { login, guest } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    await guest();
    navigate("/dashboard");
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your medications.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-10" />
          </div>
        </div>
        <div>
          <Label>Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10" />
          </div>
        </div>

        {error && <p className="text-sm text-danger-600 bg-danger-50 px-3 py-2 rounded-lg">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in…" : <>Sign in <ArrowRight className="w-4 h-4" /></>}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-ink-300">or</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <Button variant="secondary" onClick={handleGuest} className="w-full">
        <UserIcon className="w-4 h-4" /> Continue as Guest
      </Button>

      <p className="text-center text-sm text-ink-500 mt-5">
        New here? <Link to="/register" className="text-primary-600 font-medium hover:underline">Create an account</Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-10 -left-10 w-64 h-64 rounded-full bg-accent-400/20 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold">PillSync</span>
          </div>
        </div>
        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight">Smart medication management for everyday life.</h2>
          <p className="mt-4 text-primary-100 text-lg">Track medicines, get reminders, monitor adherence and never miss a dose.</p>
          <div className="mt-8 flex gap-6 text-sm">
            <div><p className="text-2xl font-bold">8+</p><p className="text-primary-200">Features</p></div>
            <div><p className="text-2xl font-bold">OCR</p><p className="text-primary-200">Scan labels</p></div>
            <div><p className="text-2xl font-bold">100%</p><p className="text-primary-200">Local</p></div>
          </div>
        </div>
        <p className="relative text-xs text-primary-200">College demonstration project · For presentation only</p>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-bold text-ink-900 text-lg">PillSync</span>
          </div>
          <h1 className="text-2xl font-bold text-ink-900">{title}</h1>
          <p className="text-ink-500 mt-1.5 mb-7">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
