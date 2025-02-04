import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to the Dashboard</h1>
      <p className="text-gray-600 mb-6">Manage your notes efficiently and stay organized.</p>
      <button 
        onClick={handleGoHome} 
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Go to Home
      </button>
    </div>
  );
};

export default Dashboard;