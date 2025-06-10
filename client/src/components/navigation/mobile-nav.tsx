import { Link, useLocation } from "wouter";
import { useQRScanner } from "@/components/qr/qr-scanner-modal";
import { Home, Search, Bookmark, Briefcase, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  name: string;
  href: string;
}

export default function MobileNav() {
  const [location] = useLocation();
  const { openScanner } = useQRScanner();
  const { user, logout } = useAuth();

  const navItems: NavItem[] = [
    { name: "הפרופיל שלי", href: "/profile" },
    { name: "משתמשים", href: "/users" },
    { name: "בתי עסק", href: "/businesses" },
    { name: "בית", href: "/" },
  ];

  // פונקציה להפעלת סורק ה-QR
  const handleScanClick = () => {
    // פותח את סורק ה-QR ללא קולבק ספציפי
    // הסורק יטפל אוטומטית בניתוב לאחר סריקה מוצלחת
    console.log("פותח סורק QR ממובייל");
    openScanner();
  };

  return (
    <>
      {/* אייקון משתמש בצד שמאל למעלה */}
      <div className="md:hidden fixed top-0 left-0 w-full z-40 flex justify-between items-center px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div></div>
        <div></div>
        <div className="flex justify-end">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar>
                  <AvatarImage src={user.photoURL || ""} />
                  <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
                  <LogOut className="ml-2 h-4 w-4" />
                  <span>התנתק</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      {/* ניווט תחתון */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30">
        {user ? (
          <div className="flex justify-around items-center h-16">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full ${
                  location === item.href
                    ? "text-primary-600 dark:text-primary-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                <span className="text-xs">{item.name}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </nav>
    </>
  );
}