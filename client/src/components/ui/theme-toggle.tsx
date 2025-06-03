import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";

export function ThemeToggle({ variant = "default", size = "default", className = "" }) {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function MobileThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      {theme === "dark" ? (
        <Sun className="h-6 w-6 text-gray-400" />
      ) : (
        <Moon className="h-6 w-6 text-gray-500" />
      )}
      <span className="text-xs mt-1">Theme</span>
    </div>
  );
}
