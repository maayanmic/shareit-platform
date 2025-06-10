import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { 
  signInWithGoogle, 
  signInWithFacebook, 
  handleAuthRedirect, 
  registerWithEmail, 
  loginWithEmail, 
  logoutUser, 
  getUserData 
} from '../lib/firebase';
import { useToast } from "./use-toast";
import { useLocation } from "wouter";

interface AuthUser extends User {
  coins?: number;
  referrals?: number;
  savedOffers?: number;
  role?: string;
  isAdmin?: boolean;
  connections?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const isAuthenticated = user !== null;

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // בדיקה למובייל אם יש הפניה מפייסבוק בתהליך
    const handleMobileAuthRedirect = async () => {
      try {
        const authResult = await handleAuthRedirect();
        if (authResult) {
          console.log("הופנה בהצלחה מפייסבוק במובייל");
          toast({
            title: "ברוך הבא!",
            description: "התחברת בהצלחה באמצעות פייסבוק.",
          });
          setLocation("/");
        }
      } catch (error) {
        console.error("שגיאה בטיפול בהפניה:", error);
      }
    };

    // הפעל את הבדיקה לטיפול בהפניה
    handleMobileAuthRedirect();
    
    // בדיקה אם יש משתמש בלוקל סטורג' - לשיפור החוויה עד לטעינת פיירבייס
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }
    
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      console.log("Auth state changed", firebaseUser ? `User logged in: ${firebaseUser.email}` : "No user");
      
      if (firebaseUser) {
        // Get user data from Firestore to append coins, referrals, etc.
        try {
          const userData = await getUserData(firebaseUser.uid);
          // טיפול במקרה שהמשתמש קיים בפיירבייס אבל אין עבורו מסמך ב-Firestore
          const enhancedUser = {
            ...firebaseUser,
            coins: userData?.coins || 0,
            referrals: userData?.referrals || 0,
            savedOffers: userData?.savedOffers || 0,
            role: userData?.role || "user",
            isAdmin: userData?.role === "admin",
            connections: (userData as any)?.connections || [],
          } as AuthUser;
          setUser(enhancedUser);
          
          // שמירת משתמש בלוקל סטורג'
          const userToStore = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            coins: userData?.coins || 0,
            referrals: userData?.referrals || 0,
            savedOffers: userData?.savedOffers || 0,
          };
          localStorage.setItem('authUser', JSON.stringify(userToStore));
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(firebaseUser as AuthUser);
        }
      } else {
        setUser(null);
        localStorage.removeItem('authUser');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await loginWithEmail(email, password);
      
      // קבל נתוני משתמש נוספים מפיירסטור
      if (userCredential) {
        const userData = await getUserData(userCredential.uid);
        if (userData) {
          // שמירת משתמש בלוקל סטורג' להתמודדות עם ריענון דף
          const userToStore = {
            uid: userCredential.uid,
            email: userCredential.email,
            displayName: userCredential.displayName,
            photoURL: userCredential.photoURL,
            coins: userData?.coins || 0,
            referrals: userData?.referrals || 0,
            savedOffers: userData?.savedOffers || 0,
          };
          localStorage.setItem('authUser', JSON.stringify(userToStore));
        }
      }
      
      toast({
        title: "ברוך שובך!",
        description: "התחברת בהצלחה",
      });
      setLocation("/");
    } catch (error: any) {
      console.error("Login error: ", error);
      let errorMessage = "ההתחברות נכשלה. נא לבדוק את הפרטים שהזנת.";
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "אימייל או סיסמה לא תקינים.";
      }
      toast({
        title: "שגיאת התחברות",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      await registerWithEmail(email, password, displayName);
      toast({
        title: "חשבון נוצר!",
        description: "החשבון שלך נוצר בהצלחה.",
      });
      setLocation("/");
    } catch (error: any) {
      console.error("Registration error: ", error);
      let errorMessage = "יצירת החשבון נכשלה.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "האימייל הזה כבר רשום במערכת.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "הסיסמה חלשה מדי. השתמש לפחות ב-6 תווים.";
      }
      toast({
        title: "שגיאת הרשמה",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithGoogle();
      toast({
        title: "ברוך הבא!",
        description: "התחברת בהצלחה באמצעות גוגל.",
      });
      setLocation("/");
    } catch (error: any) {
      console.error("Google login error: ", error);
      toast({
        title: "שגיאת התחברות",
        description: error.message || "התחברות דרך גוגל נכשלה.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const loginWithFacebook = async () => {
    try {
      console.log("מתחיל התחברות פייסבוק...");
      
      // זיהוי מובייל מתקדם
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(navigator.userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      const isMobile = isMobileDevice || (isTouchDevice && isSmallScreen);
      
      console.log("Device info:", { userAgent, isMobileDevice, isTouchDevice, isSmallScreen, isMobile });
      
      if (isMobile) {
        console.log("התחברות פייסבוק במובייל...");
        toast({
          title: "מעביר לפייסבוק...",
          description: "אתה תועבר לדף פייסבוק להתחברות",
        });
      }
      
      // קריאה אחידה לכל המכשירים
      await signInWithFacebook();
      console.log("Facebook authentication initiated");
      
      if (!isMobile) {
        toast({
          title: "ברוך הבא!",
          description: "התחברת בהצלחה באמצעות פייסבוק.",
        });
        setLocation("/");
      }
    } catch (error: any) {
      console.error("שגיאה בהתחברות פייסבוק: ", error);
      
      // הודעת שגיאה מותאמת למובייל
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      let errorMessage = "התחברות דרך פייסבוק נכשלה";
      
      if (isMobile && error.message.includes("popup")) {
        errorMessage = "נסה לרענן את הדף ולנסות שוב";
      }
      
      toast({
        title: "שגיאת התחברות",
        description: error.message || errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('authUser');
      toast({
        title: "להתראות!",
        description: "התנתקת בהצלחה",
      });
      setLocation("/");
    } catch (error: any) {
      console.error("Logout error: ", error);
      toast({
        title: "שגיאה",
        description: "התנתקות נכשלה",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    loginWithGoogle,
    loginWithFacebook,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};