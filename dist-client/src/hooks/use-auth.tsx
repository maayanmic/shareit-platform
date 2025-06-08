import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  auth, 
  signInWithGoogle, 
  signInWithFacebook, 
  registerWithEmail, 
  loginWithEmail, 
  logoutUser,
  getUserData,
  handleAuthRedirect
} from "@/lib/firebase";
import { User } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

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

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  loginWithFacebook: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

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
            isAdmin: userData?.isAdmin || false
          };
          
          // שמירת משתמש בלוקל סטורג' להתמודדות עם ריענון דף
          const userToStore = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            coins: userData?.coins || 0,
            referrals: userData?.referrals || 0,
            savedOffers: userData?.savedOffers || 0,
            role: userData?.role || "user",
            isAdmin: userData?.isAdmin || false,
          };
          localStorage.setItem('authUser', JSON.stringify(userToStore));
          
          setUser(enhancedUser);
        } catch (error) {
          console.error("Error fetching user data: ", error);
          setUser(firebaseUser as AuthUser);
        }
      } else {
        // כאשר מתנתקים, מנקים את המשתמש מהלוקל סטורג'
        localStorage.removeItem('authUser');
        setUser(null);
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
        title: "Account created!",
        description: "Your account has been successfully created.",
      });
      setLocation("/");
    } catch (error: any) {
      console.error("Registration error: ", error);
      let errorMessage = "Failed to create an account.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use at least 6 characters.";
      }
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      toast({
        title: "Welcome!",
        description: "You have successfully logged in with Google.",
      });
      setLocation("/");
    } catch (error) {
      console.error("Google login error: ", error);
      toast({
        title: "Login Error",
        description: "Failed to log in with Google.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleFacebookLogin = async () => {
    try {
      // בדיקה אם משתמשים במובייל או שולחן עבודה
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        console.log("מתחבר דרך פייסבוק במובייל...");
        // הצגת הודעה למשתמש שהוא יועבר לפייסבוק
        toast({
          title: "מעביר לפייסבוק...",
          description: "אתה תועבר לאפליקציית פייסבוק להתחברות",
        });
        
        // במובייל - שימוש בהפניה
        await signInWithFacebook();
        // בזמן שהמשתמש מופנה לפייסבוק, לא נמשיך את הקוד כאן
      } else {
        // בשולחן עבודה (popup) נציג הודעת הצלחה כרגיל
        const user = await signInWithFacebook();
        if (user) {
          toast({
            title: "ברוך הבא!",
            description: "התחברת בהצלחה באמצעות פייסבוק.",
          });
          setLocation("/");
        }
      }
    } catch (error) {
      console.error("שגיאה בהתחברות פייסבוק: ", error);
      
      // הודעת שגיאה מותאמת למובייל
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const errorMessage = isMobile 
        ? "ההתחברות דרך פייסבוק במובייל דורשת הגדרות נוספות. אנא השתמש בהתחברות דרך Google או אימייל."
        : "נכשל בהתחברות דרך פייסבוק. נסה שוב או השתמש באמצעי התחברות אחר.";
      
      toast({
        title: "שגיאת התחברות",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      setLocation("/");
    } catch (error) {
      console.error("Logout error: ", error);
      toast({
        title: "Logout Error",
        description: "Failed to log out.",
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
    loginWithGoogle: handleGoogleLogin,
    loginWithFacebook: handleFacebookLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
