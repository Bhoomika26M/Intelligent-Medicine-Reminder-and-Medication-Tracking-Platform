import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GiPill } from 'react-icons/gi';

const AuthLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-sky-100 via-white to-emerald-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur-md border border-slate-100">
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-400 text-white shadow-md">
            <GiPill className="text-3xl animate-pulse" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-800">
            Pill<span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">Sync</span>
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Intelligent medicine reminder & tracking platform
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
