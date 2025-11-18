
import * as React from 'react';
import { TargetIcon } from './icons/TargetIcon.tsx';
import ThemeToggle from './ThemeToggle.tsx';

interface HeaderProps {
  onOpenPostLoadModal: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onOpenLoginModal: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onOpenPostLoadModal, 
  theme, 
  onToggleTheme,
  isLoggedIn,
  isAdmin,
  onOpenLoginModal,
  onLogout
}) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md dark:shadow-none dark:border-b dark:border-gray-700 sticky top-0 z-20">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TargetIcon className="h-8 w-auto" />
          <span className="hidden sm:inline text-xl font-bold text-gray-800 dark:text-gray-100 tracking-wider">
            Loadboard
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <nav className="flex items-center space-x-4">
            {isLoggedIn && isAdmin && (
              <button
                onClick={onOpenPostLoadModal}
                aria-label="Post a Load"
                title="Post a Load"
                className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150"
              >
                Post a Load
              </button>
            )}
            {isLoggedIn ? (
              <button
                onClick={onLogout}
                className="font-semibold text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="font-semibold text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Login
              </button>
            )}
          </nav>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
};

export default Header;