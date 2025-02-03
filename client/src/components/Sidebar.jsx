import React, { useState, useEffect } from "react";
import { FaBars, FaHome, FaStar, FaPlus, FaCamera, FaMicrophone, FaSignOutAlt } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import AddModal from './AddNote'

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const [addModal, setAddModal] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setIsOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`${
          isOpen ? (isMobile ? "w-54" : "w-64") : "w-16"
        } bg-gray-300 text-gray-800 border border-gray-400 flex flex-col min-h-screen h-auto transition-all duration-300`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-500">
          <h1
            className={`text-lg font-semibold ${isOpen ? "block" : "hidden"} transition-all duration-300`}
          >
            Menu
          </h1>
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600"
            >
              <FaBars size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="mt-4 space-y-2">
            <li className={`flex items-center p-4 cursor-pointer ${location.pathname === '/home' ? 'bg-gray-400' : 'hover:bg-gray-400'}`}>
              <Link to="/home" className="flex items-center w-full text-gray-800">
                <FaHome className="mr-3" />
                <span className={`${isOpen ? "block" : "hidden"}`}>Home</span>
              </Link>
            </li>
            <li className={`flex items-center p-4 cursor-pointer ${location.pathname === '/fav' ? 'bg-gray-400' : 'hover:bg-gray-400'}`}>
              <Link to="/fav" className="flex items-center w-full text-gray-800">
                <FaStar className="mr-3" />
                <span className={`${isOpen ? "block" : "hidden"}`}>Favorites</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 mt-auto border-t border-gray-500">
          <button className="w-full bg-red-500 text-white py-2 rounded flex items-center justify-center hover:bg-red-600">
            <FaSignOutAlt className="mr-2" /> {isOpen ? 'Logout':''}
          </button>
        </div>
      </div>

      {/* Floating Buttons */}
      <div  className="fixed bottom-6 right-6 flex flex-col space-y-4">
        <button onClick={()=>setAddModal(true)} className="bg-teal-500 text-white p-4 rounded-full border border-gray-500 shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400">
          <FaPlus size={24} />
        </button>
        <button onClick={()=>setAddModal(true)} className="bg-blue-500 text-white p-4 rounded-full border border-gray-500 shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
          <FaCamera size={24} />
        </button>
        <button onClick={()=>setAddModal(true)} className="bg-orange-500 text-white p-4 rounded-full border border-gray-500 shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400">
          <FaMicrophone size={24} />
        </button>
      </div>
      {addModal && <AddModal setModal={setAddModal}/>}
    </div>
  );
};

export default Sidebar;
