// src/components/Layout/Header.tsx
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="flex items-center">

        <a href="#" className="px-3 py-2 rounded hover:bg-gray-700">Reports</a>
      </nav>
      <div className="flex items-center">
        {/* Placeholder Bell Icon */}
        <svg className="h-6 w-6 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        {/* Placeholder Profile Picture */}
        <img className="h-8 w-8 rounded-full" src="https://via.placeholder.com/150" alt="Profile Picture" />
      </div>
    </header>
  );
};

export default Header;
