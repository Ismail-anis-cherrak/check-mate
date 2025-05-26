"use client";
import React from "react";
import {
  FaClipboardCheck,
  FaChartBar,
  FaUsers,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  // Map paths to sidebar items
  const getActiveItem = (path: string) => {
    switch (path) {
      case "/check-in":
        return "Check-In";
      case "/statistics":
        return "Statistics";
      case "/employees":
        return "Employees";
      case "/settings":
        return "Settings";
      default:
        return "Check-In"; // Default to "Check-In" for the root path or unknown paths
    }
  };

  const activeItem = getActiveItem(pathname);

  const handleLogout = () => {
    // Add logout logic here (e.g., clear session, redirect to login)
    console.log("Logging out...");
  };

  return (
    <div className="w-64 h-screen bg-[#F0F1F5] flex flex-col font-sans">
      {/* Logo */}
      <div className="p-6 flex justify-center items-center"> // ken p-6
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-[#5F6868]">CheckMate</h1>
          <div className="w-px h-8 bg-[#D3D3D3] ml-4"></div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 flex flex-col items-center">
        <ul className="w-full flex flex-col items-center">
          <li className="w-48 my-2">
            <Link
              href="/check-in"
              className={`flex items-center py-4 px-4 rounded-lg w-full justify-center transition-all duration-200 ${
                activeItem === "Check-In"
                  ? "bg-white text-[#4299E1] shadow-sm"
                  : "text-[#718096] hover:bg-white hover:rounded-lg hover:shadow-sm"
              }`}
            >
              <FaClipboardCheck
                className={`mr-3 ${
                  activeItem === "Check-In"
                    ? "text-[#4299E1]"
                    : "text-[#718096]"
                }`}
              />
              <span className="text-sm font-medium">Check-In</span>
            </Link>
          </li>
          <li className="w-48 my-2">
            <Link
              href="/statistics"
              className={`flex items-center py-4 px-4 rounded-lg w-full justify-center transition-all duration-200 ${
                activeItem === "Statistics"
                  ? "bg-white text-[#4299E1] shadow-sm"
                  : "text-[#718096] hover:bg-white hover:rounded-lg hover:shadow-sm"
              }`}
            >
              <FaChartBar
                className={`mr-3 ${
                  activeItem === "Statistics"
                    ? "text-[#4299E1]"
                    : "text-[#718096]"
                }`}
              />
              <span className="text-sm font-medium">Statistics</span>
            </Link>
          </li>
          <li className="w-48 my-2">
            <Link
              href="/employees"
              className={`flex items-center py-4 px-4 rounded-lg w-full justify-center transition-all duration-200 ${
                activeItem === "Employees"
                  ? "bg-white text-[#4299E1] shadow-sm"
                  : "text-[#718096] hover:bg-white hover:rounded-lg hover:shadow-sm"
              }`}
            >
              <FaUsers
                className={`mr-3 ${
                  activeItem === "Employees"
                    ? "text-[#4299E1]"
                    : "text-[#718096]"
                }`}
              />
              <span className="text-sm font-medium">Employees</span>
            </Link>
          </li>
          {/* <li className="w-48 my-2">
            <Link
              href="/settings"
              className={`flex items-center py-4 px-4 rounded-lg w-full justify-center transition-all duration-200 ${
                activeItem === "Settings"
                  ? "bg-white text-[#4299E1] shadow-sm"
                  : "text-[#718096] hover:bg-white hover:rounded-lg hover:shadow-sm"
              }`}
            >
              <FaCog
                className={`mr-3 ${
                  activeItem === "Settings"
                    ? "text-[#4299E1]"
                    : "text-[#718096]"
                }`}
              />
              <span className="text-sm font-medium">Time settings</span>
            </Link>
          </li> */}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
