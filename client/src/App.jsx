import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./components/Sidebar";

const App = () => {
  const location = useLocation();
  const noSidebarRoutes = ["/", "/signup"];

  return (
    <div className="flex">
      <ToastContainer />
      {!noSidebarRoutes.includes(location.pathname) && <Sidebar />}
      <div className="flex-1 p-4 bg-gray-100 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default App;
