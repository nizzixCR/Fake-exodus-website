import React from 'react';
import { FiMenu, FiLock, FiClock, FiSettings, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useWallet } from '../../context/WalletContext';

interface TopBarProps {
  toggleSidebar: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ toggleSidebar }) => {
  const { portfolioStats } = useWallet();

  return (
    <header className="h-16 bg-exodus-backgroundLight border-b border-gray-800 flex items-center justify-between px-4">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="mr-4 p-2 hover:bg-exodus-background rounded-full transition-colors"
        >
          <FiMenu className="text-exodus-text w-5 h-5" />
        </button>
        <div className="flex items-center">
          <img
            src="/images/exodus-logo.png"
            alt="Exodus Logo"
            className="h-8 w-8 mr-2"
          />
          <h1 className="text-xl font-semibold tracking-wide">
            <span className="text-exodus-text">$</span>
            <span className="text-exodus-text">{portfolioStats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </h1>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-exodus-background rounded-full transition-colors">
          <FiClock className="text-exodus-text w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-exodus-background rounded-full transition-colors">
          <FiLock className="text-exodus-text w-5 h-5" />
        </button>
        <Link
          to="/settings"
          className="p-2 hover:bg-exodus-background rounded-full transition-colors"
        >
          <FiSettings className="text-exodus-text w-5 h-5" />
        </Link>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-exodus-accent to-exodus-blue flex items-center justify-center">
          <FiUser className="text-white w-4 h-4" />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
