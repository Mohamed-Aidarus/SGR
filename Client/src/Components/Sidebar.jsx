import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaChartLine, FaTable } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="bg-blue-700 text-white w-64 h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Student Graduation Rate</h1>
      </div>
      <nav>
        <ul>
          <li className="mb-4">
            <NavLink to="/" className={({ isActive }) => (isActive ? "text-blue-300" : "")}>
              <FaHome className="inline-block mr-2" /> Home
            </NavLink>
          </li>
          <li className="mb-4">
            <NavLink to="/predict-many" className={({ isActive }) => (isActive ? "text-blue-300" : "")}>
              <FaChartLine className="inline-block mr-2" /> Predict Many
            </NavLink>
          </li>
          <li className="mb-4">
            <NavLink to="/predict-single" className={({ isActive }) => (isActive ? "text-blue-300" : "")}>
              <FaChartLine className="inline-block mr-2" /> Predict Single
            </NavLink>
          </li>
          <li className="mb-4">
            <NavLink to="/results" className={({ isActive }) => (isActive ? "text-blue-300" : "")}>
              <FaTable className="inline-block mr-2" /> Table
            </NavLink>
          </li>
          <li className="mb-4">
            <NavLink to="/users" className={({ isActive }) => (isActive ? "text-blue-300" : "")}>
              <FaTable className="inline-block mr-2" /> User Management
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
