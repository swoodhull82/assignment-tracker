// src/components/Layout/SidebarNav.tsx
import React from 'react';

interface SidebarNavProps {
  activePage: 'Overview' | 'Documents' | 'Reviews' | 'Reminders' | 'Settings';
}

const SidebarNav: React.FC<SidebarNavProps> = ({ activePage }) => {
  const navItems = [
    { name: 'Overview', href: '#' },
    { name: 'Documents', href: '#' },
    { name: 'Reviews', href: '/calendar.html' }, // Link to the calendar page
    { name: 'Reminders', href: '/reminders.html' }, // Link to this reminders page
    { name: 'Settings', href: '#' },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white p-6 space-y-6 flex flex-col">
      <div className="text-2xl font-semibold text-center text-white">MyCompany</div>
      <nav className="space-y-2 flex-grow">
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={`block px-4 py-2.5 rounded hover:bg-gray-700 transition-colors duration-150 ${
              activePage === item.name ? 'bg-gray-700' : ''
            }`}
          >
            {item.name}
          </a>
        ))}
      </nav>
      <div className="text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} MyCompany Inc.</p>
      </div>
    </aside>
  );
};

export default SidebarNav;
