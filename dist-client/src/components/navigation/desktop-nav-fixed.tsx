import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { getLogoURL } from "@/lib/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings } from "lucide-react";

export default function DesktopNav() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const url = await getLogoURL();
        console.log("Logo URL loaded:", url);
        setLogoUrl(url);
      } catch (error) {
        console.error("Failed to load logo:", error);
      }
    };
    
    fetchLogo();
  }, []);

  const navItems = [
    { name: "דף הבית", href: "/" },
    { name: "בתי עסק", href: "/businesses" },
    { name: "ההמלצות שלי", href: "/profile" },
    { name: "הצעות שמורות", href: "/saved-offers" },
  ];

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 shadow-sm px-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center space-x-2 text-primary-500 cursor-pointer">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="ShareIt Logo" 
                className="h-8 w-auto ml-2" 
              />
            ) : (
              <svg 
                className="w-8 h-8 ml-2 text-primary-500" 
                fill="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
              </svg>
            )}
            <span className="text-xl font-semibold">ShareIt</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="flex items-center space-x-8">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span
                className={`text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-500 font-medium cursor-pointer ${
                  location === item.href
                    ? "text-primary-600 dark:text-primary-500"
                    : ""
                }`}
              >
                {item.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-4">
          <ThemeToggle variant="ghost" size="icon" />

          {user ? (
            <>
              {/* Digital wallet button with coin count */}
              <Link href="/profile">
                <button className="flex items-center space-x-1 px-3 py-1 bg-primary-50 dark:bg-gray-700 text-primary-700 dark:text-primary-300 rounded-full">
                  <span className="coin-float">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-amber-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span className="font-medium">{user.coins || 0}</span>
                </button>
              </Link>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={user.photoURL || ""} />
                      <AvatarFallback>
                        {user.displayName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">
                          {user.displayName}
                        </span>
                        {user.isAdmin && (
                          <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
                            מנהל
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        @{user.displayName?.toLowerCase().replace(/\s+/g, "") || "user"}
                      </span>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>החשבון שלי</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem>
                      <User className="ml-2 h-4 w-4" />
                      <span>פרופיל</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/saved-offers">
                    <DropdownMenuItem>
                      <Settings className="ml-2 h-4 w-4" />
                      <span>הצעות שמורות</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="ml-2 h-4 w-4" />
                    <span>התנתקות</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login">
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition duration-300">
                התחברות
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}