import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import Businesses from "@/pages/businesses";
import SavedOffers from "@/pages/saved-offers";
import Profile from "@/pages/profile";
import Users from "@/pages/users";
import UserProfile from "@/pages/user-profile";
import ScannedBusiness from "@/pages/scanned-business";
import RecommendationPage from "@/pages/recommendation";
import RecommendationById from "@/pages/recommendation-by-id";
import BusinessPage from "@/pages/business";
import RedeemOffer from "@/pages/redeem-offer";
import DesktopNav from "@/components/navigation/desktop-nav";
import MobileNav from "@/components/navigation/mobile-nav";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { QRScannerProvider } from "@/components/qr/qr-scanner-modal";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { handleAuthRedirect } from "@/lib/firebase";

function Router() {
  const { user, loading } = useAuth();
  
  // אם עדיין טוען את מצב המשתמש, נציג מסך טעינה
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return (
    <Switch>
      <Route path="/login">
        {user ? <Home /> : <Login />}
      </Route>
      <Route path="/register">
        {user ? <Home /> : <Register />}
      </Route>
      <Route path="/">
        {user ? <Home /> : <Login />}
      </Route>
      <Route path="/businesses">
        {user ? <Businesses /> : <Login />}
      </Route>
      <Route path="/saved-offers">
        {user ? <SavedOffers /> : <Login />}
      </Route>
      <Route path="/profile">
        {user ? <Profile /> : <Login />}
      </Route>

      <Route path="/business/:businessId">
        {user ? <BusinessPage /> : <Login />}
      </Route>
      <Route path="/business/:businessId/scan">
        {user ? <ScannedBusiness /> : <Login />}
      </Route>
      <Route path="/users">
        {user ? <Users /> : <Login />}
      </Route>
      <Route path="/user/:userId">
        {user ? <UserProfile /> : <Login />}
      </Route>
      <Route path="/recommendation/:id">
        <RecommendationById />
      </Route>
      <Route path="/redeem-offer/:offerId">
        {user ? <RedeemOffer /> : <Login />}
      </Route>
      <Route>
        {user ? <NotFound /> : <Login />}
      </Route>
    </Switch>
  );
}

// נוטרל - עכשיו זה מטופל ישירות בניתוב הראשי

function App() {
  // Handle authentication redirects
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        await handleAuthRedirect();
      } catch (error) {
        console.error("Error handling redirect: ", error);
      }
    };
    
    checkRedirectResult();
  }, []);

  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
          <DesktopNav />
          <QRScannerProvider>
            <div className="container mx-auto pt-4 md:pt-20 pb-24 md:pb-8 px-4">
              <Router />
            </div>
            <MobileNav />
          </QRScannerProvider>
        </div>
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
