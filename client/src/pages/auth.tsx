import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun } from "lucide-react";

export default function Auth() {
  const { loginWithGoogle, loginWithFacebook } = useAuth();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState<'google' | 'facebook' | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading('google');
    try {
      console.log("Auth page: Google login button clicked");
      await loginWithGoogle();
    } catch (error: any) {
      console.error("Auth page: Google login error:", error);
      toast({
        title: "התחברות נכשלה",
        description: error.message || "לא ניתן להתחבר דרך גוגל. נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading('facebook');
    try {
      console.log("Auth page: Facebook login button clicked");
      await loginWithFacebook();
    } catch (error: any) {
      console.error("Auth page: Facebook login error:", error);
      toast({
        title: "התחברות נכשלה",
        description: error.message || "לא ניתן להתחבר דרך פייסבוק. נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const testMobileDetection = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    
    const detectionResult = {
      userAgent,
      isMobileDevice,
      isTouchDevice,
      isSmallScreen,
      windowWidth: window.innerWidth,
      finalResult: isMobileDevice || (isTouchDevice && isSmallScreen)
    };
    
    console.log("Mobile detection test:", detectionResult);
    toast({
      title: "Mobile Detection",
      description: `Mobile: ${detectionResult.finalResult ? 'Yes' : 'No'}, Width: ${window.innerWidth}px`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleTheme}
        className="absolute top-4 right-4"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to ShareIt</CardTitle>
          <CardDescription>
            Connect with your social media accounts to start sharing recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 gap-3">
            <Button 
              variant="outline" 
              onClick={handleGoogleLogin}
              disabled={isLoading !== null}
              className="h-12"
            >
              {isLoading === 'google' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-500 mr-2"></div>
              ) : (
                <FcGoogle className="mr-2 h-5 w-5" />
              )}
              Continue with Google
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleFacebookLogin} 
              disabled={isLoading !== null}
              className="h-12"
            >
              {isLoading === 'facebook' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-500 mr-2"></div>
              ) : (
                <FaFacebook className="mr-2 h-5 w-5 text-blue-600" />
              )}
              Continue with Facebook
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={testMobileDetection}
              className="h-8 text-sm"
            >
              Test Mobile Detection
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500 dark:text-gray-400">
            By logging in, you agree to our{" "}
            <a href="#" className="text-primary-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary-600 hover:underline">
              Privacy Policy
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
