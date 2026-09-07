import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div className="flex min-h-screen bg-[#0F1117] text-white">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-72 bg-[#0F1117] ">

        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="bg-[#0F1117] min-h-[calc(100vh-80px)] p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default MainLayout;