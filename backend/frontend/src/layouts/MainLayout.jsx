import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";


function MainLayout() {

  return (

    <div className="flex min-h-screen bg-gradient-to-br from-[#F5F3FF] via-[#FAF5FF] to-[#EDE9FE]">


      {/* Sidebar */}
      <Sidebar />


      {/* Main Area */}
      <div className="flex-1">


        {/* Navbar */}
        <Navbar />


        {/* Content */}
        <main className="p-10">

          <Outlet />

        </main>


      </div>


    </div>

  );

}


export default MainLayout;