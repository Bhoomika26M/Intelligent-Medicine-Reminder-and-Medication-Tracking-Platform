import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button, Input, Label } from "@/components/ui";
import { AuthShell } from "@/pages/Login";
import { Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";

export default function Register() {
  const { register, guest } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    await guest();
    navigate("/dashboard");
  };

  return (
    <AuthShell title="Create your account" subtitle="Start managing your medications in minutes.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Full name</Label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" />
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="pl-10" />
          </div>
        </div>
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
            <Input type="password" required minLength={4} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10" />
          </div>
        </div>

        {error && <p className="text-sm text-danger-600 bg-danger-50 px-3 py-2 rounded-lg">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating account…" : <>Create account <ArrowRight className="w-4 h-4" /></>}
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
        Already have an account? <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
