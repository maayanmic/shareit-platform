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
    { name: "הפרופיל שלי", href: "/profile" },
    { name: "משתמשים", href: "/users" },
    { name: "בתי עסק", href: "/businesses" },
    { name: "בית", href: "/" },
  ];

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30 shadow-sm px-4">
      <div className="container mx-auto flex justify-between items-center h-full">
        {/* User Profile - Right side */}
        <div className="flex items-center space-x-4 flex-1 justify-start">
          <ThemeToggle variant="ghost" size="icon" />

          {user ? (
            <>
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
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>
                    {user.displayName || "משתמש"}
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="ml-2 h-4 w-4" />
                      <span>הפרופיל שלי</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer"
                  >
                    <LogOut className="ml-2 h-4 w-4" />
                    <span>התנתק</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login">
              <span className="text-primary-600 dark:text-primary-500 font-semibold hover:underline">
                התחבר / הירשם
              </span>
            </Link>
          )}
        </div>

        {/* Desktop Navigation Links - Center */}
        <div className="flex items-center space-x-12">
          {user && navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span
                className={`text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-500 font-medium cursor-pointer px-4 py-1 text-lg ${
                  location === item.href
                    ? "text-primary-600 dark:text-primary-500 font-bold border-b-2 border-primary-500"
                    : ""
                }`}
              >
                {item.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Logo - Left side */}
        <div className="flex-1 flex justify-end">
          <Link href="/">
            <div className="flex items-center text-primary-500 cursor-pointer">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="ShareIt Logo" 
                  className="h-16 w-auto" 
                />
              ) : (
                <svg 
                  className="w-16 h-16 text-primary-500" 
                  fill="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
                </svg>
              )}
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}