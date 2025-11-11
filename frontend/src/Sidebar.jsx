import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { menuItem } from "./MenuData";

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen(!isOpen);
  const navigate = useNavigate();

  return (
    <div className="flex border-r-2 border-mainColor">
      {/* Sidebar container */}
      <div
        className={`transition-all duration-300 h-screen ${
          isOpen ? "w-60" : "w-16"
        }`}
      >
        <button onClick={toggle} className="p-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 28 28"
            strokeWidth="2.0"
            stroke="white"
            className="size-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
            />
          </svg>
        </button>

        {/* Sidebar items */}
        {menuItem.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `py-4 px-5 flex items-center overflow-hidden text-[22px] hover:cursor-pointer ${
                isActive
                  ? "bg-mainColor text-white font-semibold"
                  : "hover:bg-mainColor hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span>{isActive ? item.svgAlt : item.svg}</span>
                <span className="px-5">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
