import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/contexts/auth-context";
import { 
  Sun, 
  Moon, 
  LogOut
} from "lucide-react";

export function DesktopNavigation() {
  const [location] = useLocation();
  const { toggleTheme, theme } = useTheme();
  const { user, logout, userCoins } = useAuth();

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 shadow-sm px-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-500 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span className="text-xl font-semibold">ShareIt</span>
          </div>
        </Link>
        
        {/* Desktop Navigation Links */}
        <div className="flex items-center space-x-8">
          <Link href="/">
            <a className={`font-medium ${location === '/' ? 'text-primary-600 dark:text-primary-500' : 'text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-500'}`}>
              Home
            </a>
          </Link>
          <Link href="/discover">
            <a className={`font-medium ${location === '/discover' ? 'text-primary-600 dark:text-primary-500' : 'text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-500'}`}>
              Discover
            </a>
          </Link>
          <Link href="/my-recommendations">
            <a className={`font-medium ${location === '/my-recommendations' ? 'text-primary-600 dark:text-primary-500' : 'text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-500'}`}>
              My Recommendations
            </a>
          </Link>
          <Link href="/saved-offers">
            <a className={`font-medium ${location === '/saved-offers' ? 'text-primary-600 dark:text-primary-500' : 'text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-500'}`}>
              Saved Offers
            </a>
          </Link>
        </div>
        
        {/* Right side controls */}
        <div className="flex items-center space-x-4">
          {/* Dark mode toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          {/* Digital wallet button with coin count */}
          <div className="flex items-center space-x-1 px-3 py-1 bg-primary-50 dark:bg-gray-700 text-primary-700 dark:text-primary-300 rounded-full">
            <span className="animate-[coinFloat_2s_ease-in-out_infinite]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="font-medium">{userCoins}</span>
          </div>
          
          {/* Profile dropdown */}
          <div className="flex items-center space-x-2">
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{user?.displayName}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">@{user?.displayName?.toLowerCase().replace(/\s+/g, '')}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
