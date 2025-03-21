import React from 'react';
import {
  FiHome,
  FiPieChart,
  FiTrendingUp,
  FiSend,
  FiPlus,
  FiGrid,
  FiArrowLeft,
  FiArrowRight,
  FiSettings
} from 'react-icons/fi';
import { NavLink, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const sidebarItems = [
    { icon: <FiHome />, label: 'Dashboard', path: '/dashboard', active: location.pathname === '/dashboard' },
    { icon: <FiPieChart />, label: 'Portfolio', path: '/portfolio', active: location.pathname === '/portfolio' },
    { icon: <FiTrendingUp />, label: 'Exchange', path: '/exchange', active: location.pathname === '/exchange' },
    { icon: <FiSend />, label: 'Send', path: '/send', active: location.pathname === '/send' },
    { icon: <FiPlus />, label: 'Receive', path: '/receive', active: location.pathname === '/receive' },
    { icon: <FiGrid />, label: 'Apps', path: '/apps', active: location.pathname === '/apps' },
    { icon: <FiSettings />, label: 'Settings', path: '/settings', active: location.pathname === '/settings' },
  ];

  return (
    <aside
      className={`bg-exodus-backgroundLight border-r border-gray-800 h-full overflow-hidden transition-all ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <img
            src="/images/exodus-logo.png"
            alt="Exodus Logo"
            className="h-10 w-10"
          />
          {isOpen && (
            <h2 className="ml-2 text-xl font-semibold tracking-wide text-exodus-text">
              Exodus
            </h2>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 text-exodus-textSecondary hover:bg-exodus-background rounded-full transition-colors"
        >
          {isOpen ? <FiArrowLeft /> : <FiArrowRight />}
        </button>
      </div>

      <nav className="mt-6">
        <ul className="space-y-2">
          {sidebarItems.map((item, index) => (
            <li key={index} className="px-4">
              <NavLink
                to={item.path}
                className={({ isActive }) => `flex items-center p-3 rounded-md transition-colors ${
                  isActive
                    ? 'bg-exodus-accent bg-opacity-10 text-exodus-accent'
                    : 'text-exodus-textSecondary hover:bg-exodus-background'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {isOpen && <span className="ml-4">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
