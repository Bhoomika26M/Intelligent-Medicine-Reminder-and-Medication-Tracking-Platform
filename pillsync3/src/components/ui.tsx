import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({
  label, value, icon, tone = "primary",
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: "primary" | "success" | "warning" | "danger" | "accent" | "neutral";
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary-50 text-primary-600",
    success: "bg-success-50 text-success-600",
    warning: "bg-warning-50 text-warning-600",
    danger: "bg-danger-50 text-danger-600",
    accent: "bg-teal-50 text-accent-600",
    neutral: "bg-slate-100 text-ink-500",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tones[tone]}`}>
          {icon}
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold text-ink-900">{value}</p>
    </Card>
  );
}

export function Button({
  children, variant = "primary", className = "", ...props
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants: Record<string, string> = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm",
    secondary: "bg-white text-ink-700 border border-slate-200 hover:bg-slate-50",
    danger: "bg-danger-500 text-white hover:bg-danger-600",
    ghost: "text-ink-500 hover:bg-slate-100",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition ${props.className ?? ""}`}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="block text-sm font-medium text-ink-700 mb-1.5">{children}</label>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "primary" | "success" | "warning" | "danger" | "neutral" }) {
  const tones: Record<string, string> = {
    primary: "bg-primary-50 text-primary-700",
    success: "bg-success-50 text-success-600",
    warning: "bg-warning-50 text-warning-600",
    danger: "bg-danger-50 text-danger-600",
    neutral: "bg-slate-100 text-ink-500",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-ink-300 mb-4">
        {icon}
      </div>
      <p className="font-medium text-ink-700">{title}</p>
      {subtitle && <p className="text-sm text-ink-500 mt-1 max-w-sm">{subtitle}</p>}
    </div>
  );
}
