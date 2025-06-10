import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  GoogleAuthProvider, 
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  deleteDoc, 
  query, 
  where,
  updateDoc,
  addDoc,
  serverTimestamp,
  orderBy,
  limit
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL
} from "firebase/storage";

// Firebase configuration - to be added as environment variables in production
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "placeholder-api-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "placeholder-project"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "placeholder-project",
  storageBucket: "shareit-454f0.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "placeholder-messaging-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "placeholder-app-id"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ניסיון ליצור קולקשנים אם הם לא קיימים
(async () => {
  try {
    console.log("מתחיל ליצור קולקשנים בפיירבייס...");
    
    // בדיקה והקמה של קולקשן המשתמשים
    const usersCollectionRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollectionRef);
    console.log(`קולקשן users קיים וכולל ${usersSnapshot.docs.length} משתמשים`);
    
    // בדיקה והקמה של קולקשן העסקים
    const businessesCollectionRef = collection(db, "businesses");
    const businessesSnapshot = await getDocs(businessesCollectionRef);
    console.log(`קולקשן businesses קיים וכולל ${businessesSnapshot.docs.length} עסקים`);
    
    // בדיקה והקמה של קולקשן ההמלצות
    const recommendationsCollectionRef = collection(db, "recommendations");
    const recommendationsSnapshot = await getDocs(recommendationsCollectionRef);
    console.log(`קולקשן recommendations קיים וכולל ${recommendationsSnapshot.docs.length} המלצות`);
    
    // בדיקה והקמה של קולקשן החיבורים
    const connectionsCollectionRef = collection(db, "connections");
    const connectionsSnapshot = await getDocs(connectionsCollectionRef);
    console.log(`קולקשן connections קיים וכולל ${connectionsSnapshot.docs.length} חיבורים`);
    
    console.log("סיום יצירת קולקשנים!");
  } catch (error) {
    console.error("שגיאה ביצירת קולקשנים:", error);
  }
})();
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// יצירת קולקשנים מיד עם טעינת האפליקציה
(async function initializeCollections() {
  try {
    console.log("מתחיל ליצור קולקשנים בפיירבייס...");
    
    // יצירת קולקשן businesses אם לא קיים
    const businessesRef = collection(db, "businesses");
    const businessesSnapshot = await getDocs(businessesRef);
    
    if (businessesSnapshot.empty) {
      console.log("קולקשן businesses ריק - יוצר עסקי דוגמה");
      
      // עסקי דוגמה
      const sampleBusinesses = [
        {
          id: "coffee",
          name: "קפה טוב",
          category: "בתי קפה",
          description: "בית קפה איכותי עם מבחר עשיר של קפה, מאפים וארוחות בוקר. האווירה נעימה ומתאימה ללימודים, פגישות עבודה או סתם לבלות עם חברים.",
          address: "רחוב הרצל 123, תל אביב",
          phone: "03-1234567",
          website: "https://example.com/coffeegood",
          images: [
            "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop"
          ],
          discount: "10% הנחה על כל התפריט",
          hours: "א'-ה' 07:00-22:00, ו' 08:00-16:00, שבת סגור",
          ratings: 4.5,
          reviews: [
            {
              id: "review1",
              userId: "user123",
              userName: "ישראל ישראלי",
              rating: 5,
              text: "קפה מעולה ושירות אדיב. ממליץ בחום!",
              date: "2023-11-15",
              recommended: true
            }
          ],
          createdAt: serverTimestamp()
        },
        {
          id: "restaurant",
          name: "מסעדה טעימה",
          category: "מסעדות",
          description: "מסעדה משפחתית עם מטבח ים תיכוני עשיר וטעים. התפריט כולל מבחר מנות דגים, בשרים וצמחוניות עם חומרי גלם טריים.",
          address: "רחוב אלנבי 45, תל אביב",
          phone: "03-7654321",
          website: "https://example.com/tastyrestaurant",
          images: [
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1000&auto=format&fit=crop"
          ],
          discount: "ארוחת ילדים חינם בימי ראשון",
          hours: "א'-ש' 12:00-23:00",
          ratings: 4.2,
          reviews: [
            {
              id: "review2",
              userId: "user456",
              userName: "חנה כהן",
              rating: 4,
              text: "אוכל מצוין ואווירה נעימה. קצת יקר אבל שווה.",
              date: "2023-10-20",
              recommended: true
            }
          ],
          createdAt: serverTimestamp()
        },
        {
          id: "attire",
          name: "חנות בגדים",
          category: "אופנה",
          description: "חנות אופנה המציעה מגוון רחב של פריטי לבוש לנשים, גברים וילדים. מותגים מקומיים ובינלאומיים במחירים נוחים.",
          address: "קניון עזריאלי, קומה 2, תל אביב",
          phone: "03-9876543",
          website: "https://example.com/fashionstore",
          images: [
            "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000&auto=format&fit=crop"
          ],
          discount: "20% הנחה על הפריט השני",
          hours: "א'-ה' 09:30-22:00, ו' 09:00-15:00, שבת: שעה לאחר צאת השבת עד 23:00",
          ratings: 4.0,
          reviews: [
            {
              id: "review3",
              userId: "user789",
              userName: "דני לוי",
              rating: 4,
              text: "שירות אדיב ומבחר גדול. המחירים הוגנים.",
              date: "2023-09-05",
              recommended: true
            }
          ],
          createdAt: serverTimestamp()
        }
      ];
      
      // הוסף את העסקים לדאטהבייס
      for (const business of sampleBusinesses) {
        try {
          console.log(`מנסה ליצור עסק: ${business.name} עם מזהה: ${business.id}`);
          
          // יצירת עסק עם מזהה מוגדר מראש
          await setDoc(doc(db, "businesses", business.id), business);
          
          console.log(`נוצר בהצלחה עסק לדוגמה: ${business.name}`);
        } catch (error) {
          console.error(`שגיאה ביצירת עסק ${business.name}:`, error);
        }
      }
    } else {
      console.log(`קולקשן businesses קיים וכולל ${businessesSnapshot.docs.length} עסקים`);
    }
    
    // יצירת קולקשן recommendations אם לא קיים
    const recommendationsRef = collection(db, "recommendations");
    const recommendationsSnapshot = await getDocs(recommendationsRef);
    
    if (recommendationsSnapshot.empty) {
      console.log("קולקשן recommendations ריק - יוצר המלצות דוגמה");
      
      // המלצות דוגמה
      const sampleRecommendations = [
        {
          id: "rec1",
          businessId: "coffee",
          userId: "demo_user1",
          userName: "ישראל ישראלי",
          userPhotoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40",
          businessName: "קפה טוב",
          businessImage: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=1000&auto=format&fit=crop",
          text: "המקום הכי טוב לקפה בעיר! השירות אדיב והאווירה נעימה. ממליץ בחום על הקרואסון שוקולד!",
          rating: 5,
          discount: "10% הנחה",
          validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          savedCount: 12,
          createdAt: serverTimestamp()
        }
      ];
      
      // הוסף את ההמלצות לדאטהבייס
      for (const rec of sampleRecommendations) {
        try {
          console.log(`מנסה ליצור המלצה: ${rec.id}`);
          await setDoc(doc(db, "recommendations", rec.id), rec);
          console.log(`נוצרה בהצלחה המלצה לדוגמה: ${rec.id}`);
        } catch (error) {
          console.error(`שגיאה ביצירת המלצה ${rec.id}:`, error);
        }
      }
    } else {
      console.log(`קולקשן recommendations קיים וכולל ${recommendationsSnapshot.docs.length} המלצות`);
    }
    
    // יצירת קולקשן users אם לא קיים
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);
    
    if (usersSnapshot.empty) {
      console.log("קולקשן users ריק - יוצר משתמשי דוגמה");
      
      // משתמשי דוגמה
      const sampleUsers = [
        {
          uid: "demo_user1",
          email: "demo@example.com",
          displayName: "ישראל ישראלי",
          photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40",
          coins: 50,
          referrals: 3,
          savedOffers: 5,
          createdAt: serverTimestamp()
        }
      ];
      
      // הוסף את המשתמשים לדאטהבייס
      for (const user of sampleUsers) {
        try {
          console.log(`מנסה ליצור משתמש: ${user.displayName}`);
          await setDoc(doc(db, "users", user.uid), user);
          console.log(`נוצר בהצלחה משתמש לדוגמה: ${user.displayName}`);
        } catch (error) {
          console.error(`שגיאה ביצירת משתמש ${user.displayName}:`, error);
        }
      }
    } else {
      console.log(`קולקשן users קיים וכולל ${usersSnapshot.docs.length} משתמשים`);
    }
    
    console.log("סיום יצירת קולקשנים!");
  } catch (error) {
    console.error("שגיאה ביצירת קולקשנים:", error);
  }
})();

// פונקציה משופרת לזיהוי מובייל
const isMobile = () => {
  // זיהוי מובייל רב-שכבתי
  const userAgent = navigator.userAgent.toLowerCase();
  
  // בדיקה ראשונית לפי User Agent
  const mobileKeywords = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;
  const isMobileUA = mobileKeywords.test(navigator.userAgent);
  
  // בדיקה לפי יכולות המכשיר
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;
  
  // בדיקה נוספת לפי platform
  const mobileOS = /android|ios|iphone|ipad|ipod/i.test(navigator.platform || '');
  
  // תוצאה סופית
  const result = isMobileUA || mobileOS || (isTouchDevice && isSmallScreen);
  
  console.log("Enhanced mobile detection:", {
    userAgent: userAgent,
    isMobileUA,
    mobileOS,
    isTouchDevice,
    isSmallScreen,
    windowWidth: window.innerWidth,
    platform: navigator.platform,
    finalResult: result
  });
  
  return result;
};

// Auth functions
export const signInWithGoogle = async () => {
  try {
    let result;
    
    // במובייל נשתמש ב-redirect, במחשב ב-popup
    if (isMobile()) {
      console.log("התחברות גוגל במובייל עם redirect...");
      await signInWithRedirect(auth, googleProvider);
      return; // התוצאה תטופל ב-handleAuthRedirect
    } else {
      console.log("התחברות גוגל במחשב עם popup...");
      result = await signInWithPopup(auth, googleProvider);
    }
    
    const user = result.user;
    
    // בדוק אם המשתמש קיים ב-Firestore, אם לא צור פרופיל
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: "user",
        coins: 0,
        referrals: 0,
        savedOffers: 0,
        createdAt: serverTimestamp()
      });
    }
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    throw error;
  }
};

export const signInWithFacebook = async (forceRedirect = false) => {
  try {
    console.log("Firebase signInWithFacebook started...");
    
    // הגדרת פרמטרים מותאמים למובייל
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    provider.addScope('public_profile');
    
    // הגדרות מותאמות למובייל
    provider.setCustomParameters({
      display: 'popup',
      auth_type: 'rerequest',
      scope: 'email,public_profile'
    });
    
    let result;
    const shouldUseRedirect = forceRedirect || isMobile();
    
    if (shouldUseRedirect) {
      console.log("Firebase: התחברות פייסבוק במובייל עם redirect...");
      try {
        // במובייל - אילוץ הפניה
        await signInWithRedirect(auth, provider);
        console.log("Firebase: Redirect to Facebook initiated");
        return; // התוצאה תטופל בחזרה
      } catch (redirectError: any) {
        console.error("Firebase: Redirect failed:", redirectError);
        
        // אם redirect נכשל, ננסה popup כחלופה
        console.log("Firebase: Trying popup as fallback...");
        try {
          result = await signInWithPopup(auth, provider);
        } catch (popupError: any) {
          console.error("Firebase: Both redirect and popup failed");
          throw new Error(`Authentication failed: ${popupError.message}`);
        }
      }
    } else {
      console.log("Firebase: התחברות פייסבוק במחשב עם popup...");
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupError: any) {
        console.error("Firebase: Popup failed, trying redirect...");
        await signInWithRedirect(auth, provider);
        return;
      }
    }
    
    if (result) {
      const user = result.user;
      console.log("Firebase: User authenticated:", user.displayName);
      
      // יצירת פרופיל משתמש
      const userDocRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userDocRef);
      
      if (!userSnapshot.exists()) {
        console.log("Firebase: Creating new user profile");
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: "user",
          coins: 0,
          referrals: 0,
          savedOffers: 0,
          createdAt: serverTimestamp()
        });
      }
      
      return user;
    }
  } catch (error: any) {
    console.error("Firebase: Facebook authentication error:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    // טיפול בשגיאות ספציפיות
    let userMessage = "התחברות דרך פייסבוק נכשלה";
    if (error.code === 'auth/popup-blocked') {
      userMessage = "החלון נחסם. אנא אפשר חלונות קופצים ונסה שוב.";
    } else if (error.code === 'auth/popup-closed-by-user') {
      userMessage = "ההתחברות בוטלה על ידי המשתמש.";
    } else if (error.code === 'auth/network-request-failed') {
      userMessage = "שגיאת רשת. בדוק את החיבור לאינטרנט.";
    }
    
    throw new Error(userMessage);
  }
};

// Handle redirect result when user comes back from authentication provider
export const handleAuthRedirect = async () => {
  try {
    console.log("בודק תוצאות הפניה מספק אימות חיצוני...");
    const result = await getRedirectResult(auth);
    
    if (result) {
      console.log("התקבלה תוצאת הפניה מוצלחת:", result.providerId);
      const user = result.user;
      console.log("מידע משתמש התקבל:", user.displayName);
      
      // Check if user exists in Firestore, if not create a profile
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        console.log("יוצר פרופיל משתמש חדש בפיירסטור...");
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: "user",  // הוספת שדה role כברירת מחדל
          coins: 0,
          referrals: 0,
          savedOffers: 0,
          createdAt: serverTimestamp()
        });
        console.log("פרופיל משתמש נוצר בהצלחה!");
      } else {
        console.log("משתמש קיים במערכת, ממשיך לעמוד הבית...");
      }
      
      return user;
    } else {
      console.log("לא התקבלה תוצאת הפניה");
    }
    return null;
  } catch (error) {
    console.error("שגיאה בטיפול בתוצאת ההפניה: ", error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName,
      photoURL: null,
      role: "user",  // שדה ברירת מחדל - משתמש רגיל
      coins: 0,
      referrals: 0,
      savedOffers: 0,
      createdAt: serverTimestamp()
    });
    
    return user;
  } catch (error) {
    console.error("Error registering with email: ", error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in with email: ", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};

// Database functions
export const getUserData = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // הוספת דגל isAdmin לפי הרול וטיפול במקרה שחסר שדה role
      return {
        ...userData,
        // וידוא שיש שדה role, אם אין - שימוש בברירת מחדל "user"
        role: userData.role || "user",
        // אם שדה ה-role מוגדר כ-admin, המשתמש הוא מנהל
        isAdmin: userData.role === "admin",
        // וידוא שהשדות הנדרשים קיימים
        coins: userData.coins || 0,
        referrals: userData.referrals || 0,
        savedOffers: userData.savedOffers || 0
      };
    }
    return {
      // ערכי ברירת מחדל אם המשתמש לא נמצא ב-Firestore
      role: "user",
      isAdmin: false,
      coins: 0,
      referrals: 0,
      savedOffers: 0
    };
  } catch (error) {
    console.error("Error getting user data: ", error);
    // במקרה של שגיאה, נחזיר ערכי ברירת מחדל
    return {
      role: "user",
      isAdmin: false,
      coins: 0,
      referrals: 0,
      savedOffers: 0
    };
  }
};

export const updateUserCoins = async (userId: string, coinAmount: number) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      coins: coinAmount
    });
  } catch (error) {
    console.error("Error updating user coins: ", error);
    throw error;
  }
};

export const getBusinesses = async () => {
  try {
    const businessesCollection = collection(db, "businesses");
    const businessesSnapshot = await getDocs(businessesCollection);
    return businessesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting businesses: ", error);
    throw error;
  }
};

export const getBusinessById = async (businessId: string) => {
  try {
    // תחילה, נסה לקבל את העסק מה-collection של businesses
    const businessDoc = await getDoc(doc(db, "businesses", businessId));
    
    if (businessDoc.exists()) {
      return { id: businessDoc.id, ...businessDoc.data() };
    }
    
    // אם העסק לא נמצא, נבדוק אם יש לנו עסקים כלשהם ב-collection
    const businessesCollection = collection(db, "businesses");
    const businessesSnapshot = await getDocs(businessesCollection);
    
    if (businessesSnapshot.empty) {
      // אם אין בכלל עסקים, ננסה ליצור כמה עסקי דוגמה לצורכי פיתוח
      await createSampleBusinesses();
      
      // ננסה שוב לקבל את העסק
      const refreshedDoc = await getDoc(doc(db, "businesses", businessId));
      if (refreshedDoc.exists()) {
        return { id: refreshedDoc.id, ...refreshedDoc.data() };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error getting business by ID: ", error);
    throw error;
  }
};

// פונקציה ליצירת עסקי דוגמה
const createSampleBusinesses = async () => {
  try {
    console.log("מנסה ליצור Collection של עסקי דוגמה בפיירבייס");
    
    // בדוק אם יש כבר עסקים ב-collection
    const businessesCollection = collection(db, "businesses");
    console.log("מנסה לגשת לקולקשן businesses במסד הנתונים", db);
    
    const businessesSnapshot = await getDocs(businessesCollection);
    console.log("תוצאת בדיקת קולקשן businesses:", 
                businessesSnapshot.empty ? "ריק - צריך ליצור עסקי דוגמה" : "כבר קיים - מכיל נתונים");
    
    if (!businessesSnapshot.empty) {
      console.log("Businesses collection already has data, skipping sample creation");
      return;
    }
    
    // עסקי דוגמה
    const sampleBusinesses = [
      {
        id: "coffee",
        name: "קפה טוב",
        category: "בתי קפה",
        description: "בית קפה איכותי עם מבחר עשיר של קפה, מאפים וארוחות בוקר. האווירה נעימה ומתאימה ללימודים, פגישות עבודה או סתם לבלות עם חברים.",
        address: "רחוב הרצל 123, תל אביב",
        phone: "03-1234567",
        website: "https://example.com/coffeegood",
        images: [
          "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop"
        ],
        discount: "10% הנחה על כל התפריט",
        hours: "א'-ה' 07:00-22:00, ו' 08:00-16:00, שבת סגור",
        ratings: 4.5,
        reviews: [
          {
            id: "review1",
            userId: "user123",
            userName: "ישראל ישראלי",
            rating: 5,
            text: "קפה מעולה ושירות אדיב. ממליץ בחום!",
            date: "2023-11-15",
            recommended: true
          }
        ],
        createdAt: serverTimestamp()
      },
      {
        id: "restaurant",
        name: "מסעדה טעימה",
        category: "מסעדות",
        description: "מסעדה משפחתית עם מטבח ים תיכוני עשיר וטעים. התפריט כולל מבחר מנות דגים, בשרים וצמחוניות עם חומרי גלם טריים.",
        address: "רחוב אלנבי 45, תל אביב",
        phone: "03-7654321",
        website: "https://example.com/tastyrestaurant",
        images: [
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1000&auto=format&fit=crop"
        ],
        discount: "ארוחת ילדים חינם בימי ראשון",
        hours: "א'-ש' 12:00-23:00",
        ratings: 4.2,
        reviews: [
          {
            id: "review2",
            userId: "user456",
            userName: "חנה כהן",
            rating: 4,
            text: "אוכל מצוין ואווירה נעימה. קצת יקר אבל שווה.",
            date: "2023-10-20",
            recommended: true
          }
        ],
        createdAt: serverTimestamp()
      },
      {
        id: "attire",
        name: "חנות בגדים",
        category: "אופנה",
        description: "חנות אופנה המציעה מגוון רחב של פריטי לבוש לנשים, גברים וילדים. מותגים מקומיים ובינלאומיים במחירים נוחים.",
        address: "קניון עזריאלי, קומה 2, תל אביב",
        phone: "03-9876543",
        website: "https://example.com/fashionstore",
        images: [
          "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000&auto=format&fit=crop"
        ],
        discount: "20% הנחה על הפריט השני",
        hours: "א'-ה' 09:30-22:00, ו' 09:00-15:00, שבת: שעה לאחר צאת השבת עד 23:00",
        ratings: 4.0,
        reviews: [
          {
            id: "review3",
            userId: "user789",
            userName: "דני לוי",
            rating: 4,
            text: "שירות אדיב ומבחר גדול. המחירים הוגנים.",
            date: "2023-09-05",
            recommended: true
          }
        ],
        createdAt: serverTimestamp()
      }
    ];
    
    // הוסף את העסקים לדאטהבייס
    console.log("מתחיל להוסיף עסקי דוגמה לפיירבייס...");
    
    for (const business of sampleBusinesses) {
      try {
        console.log(`מנסה ליצור עסק: ${business.name} עם מזהה: ${business.id}`);
        
        // יצירת עסק עם מזהה מוגדר מראש
        await setDoc(doc(db, "businesses", business.id), {
          ...business
        });
        
        console.log(`נוצר בהצלחה עסק לדוגמה: ${business.name}`);
      } catch (error) {
        console.error(`שגיאה ביצירת עסק ${business.name}:`, error);
      }
    }
    
    console.log("תהליך יצירת עסקי דוגמה הושלם");
  } catch (error) {
    console.error("Error creating sample businesses: ", error);
  }
};

export const createRecommendation = async (recommendation: any) => {
  try {
    const uniqueId = `rec_${Date.now()}`;
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // חודש קדימה
    const recommendationWithId = {
      ...recommendation,
      id: uniqueId,
      createdAt: serverTimestamp(),
      validUntil
    };
    const recommendationsCollection = collection(db, "recommendations");
    const docRef = await addDoc(recommendationsCollection, recommendationWithId);
    return {
      ...recommendationWithId,
      docId: docRef.id
    };
  } catch (error) {
    console.error("Error creating recommendation: ", error);
    throw error;
  }
};

export const getRecommendations = async (limitCount = 10) => {
  try {
    const recommendationsCollection = collection(db, "recommendations");
    const q = query(
      recommendationsCollection, 
      orderBy("createdAt", "desc"), 
      limit(limitCount)
    );
    const recommendationsSnapshot = await getDocs(q);
    
    // עיבוד נתונים להמרת תאריכים מפיירבייס למחרוזות
    return recommendationsSnapshot.docs.map(doc => {
      const data = doc.data();
      
      // המרת שדה validUntil מאובייקט Timestamp למחרוזת אם הוא קיים
      if (data.validUntil && typeof data.validUntil === 'object' && 'seconds' in data.validUntil) {
        // המרה לאובייקט Date ואז למחרוזת בפורמט הרצוי
        const date = new Date(data.validUntil.seconds * 1000);
        data.validUntil = date.toLocaleDateString('he-IL', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
      
      return { id: doc.id, ...data };
    });
  } catch (error) {
    console.error("Error getting recommendations: ", error);
    throw error;
  }
};

export const getUserRecommendations = async (userId: string) => {
  try {
    console.log("Getting recommendations for user:", userId);
    
    // בדיקה - אם ה-userId אינו מחרוזת תקינה, החזר מערך ריק
    if (!userId || typeof userId !== 'string' || userId.length < 5) {
      console.warn("Invalid userId provided:", userId);
      return [];
    }
    
    const recommendationsCollection = collection(db, "recommendations");
    const q = query(
      recommendationsCollection, 
      where("userId", "==", userId)
      // הסרת מיון לפי createdAt כי ייתכן שזה גורם לבעיות אם השדה לא קיים בכל המסמכים
      // אחר כך נמיין את התוצאות בצד הלקוח
    );
    
    console.log("Fetching recommendations with query:", q);
    const recommendationsSnapshot = await getDocs(q);
    console.log("Retrieved recommendations count:", recommendationsSnapshot.docs.length);
    
    // עיבוד נתונים להמרת תאריכים מפיירבייס למחרוזות
    const results = recommendationsSnapshot.docs.map(doc => {
      const data = doc.data();
      
      // המרת שדה validUntil מאובייקט Timestamp למחרוזת אם הוא קיים
      if (data.validUntil && typeof data.validUntil === 'object' && 'seconds' in data.validUntil) {
        try {
          // המרה לאובייקט Date ואז למחרוזת בפורמט הרצוי
          const date = new Date(data.validUntil.seconds * 1000);
          data.validUntil = date.toLocaleDateString('he-IL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
        } catch (dateError) {
          console.error("Error converting date:", dateError);
          data.validUntil = "תאריך לא ידוע";
        }
      } else {
        // אם אין תאריך תוקף, קבע ערך ברירת מחדל
        data.validUntil = "ללא הגבלה";
      }
      
      // כדי להימנע מבעיות ב-rendering, טיפול בנתונים חסרים
      if (!data.imageUrl) data.imageUrl = null;
      if (!data.businessName) data.businessName = "עסק";
      if (!data.description) data.description = "אין תיאור";
      if (!data.discount) data.discount = "הנחה";
      if (!data.rating) data.rating = 5;
      if (!data.savedCount) data.savedCount = 0;
      
      return { id: doc.id, ...data };
    });
    
    console.log("Processed recommendations:", results);
    return results;
  } catch (error) {
    console.error("Error getting user recommendations: ", error);
    // במקום לזרוק שגיאה, החזר מערך ריק כך שהממשק לא ייתקע
    console.log("Returning empty array due to error");
    return [];
  }
};

export const saveOffer = async (userId: string, recommendationId: string) => {
  try {
    console.log("שומר המלצה עבור משתמש:", userId, "המלצה:", recommendationId);
    
    // מוצא את ההמלצה המקורית כדי לקבל את מזהה המפיץ
    const recommendationsCollection = collection(db, "recommendations");
    const recommendationQuery = query(recommendationsCollection, where("id", "==", recommendationId));
    const recommendationSnapshot = await getDocs(recommendationQuery);
    
    let originalReferrerId = null;
    if (!recommendationSnapshot.empty) {
      const recommendationData = recommendationSnapshot.docs[0].data();
      originalReferrerId = recommendationData.userId;
      console.log("מפיץ ההמלצה המקורי:", originalReferrerId);
    }
    
    // בדוק אם ההמלצה כבר נשמרה
    const savedOffersCollection = collection(db, "savedOffers");
    const existingQuery = query(
      savedOffersCollection,
      where("userId", "==", userId),
      where("recommendationId", "==", recommendationId),
      where("saved", "==", true)
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      console.log("המלצה כבר נשמרה קודם לכן");
      return;
    }
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // חודש קדימה
    const docRef = await addDoc(savedOffersCollection, {
      userId,
      recommendationId,
      originalReferrerId, // שומר את מזהה המפיץ המקורי
      saved: true,
      claimed: false,
      savedAt: serverTimestamp(),
      validUntil
    });
    
    console.log("המלצה נשמרה בהצלחה עם מזהה:", docRef.id);
    
    // Update user's saved offers count
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      await updateDoc(userRef, {
        savedOffers: (userData.savedOffers || 0) + 1
      });
      console.log("עודכן מספר ההמלצות השמורות של המשתמש");
    }
  } catch (error) {
    console.error("Error saving offer: ", error);
    throw error;
  }
};

export const getSavedOffers = async (userId: string) => {
  try {
    console.log("מחפש המלצות שמורות עבור משתמש:", userId);
    
    const savedOffersCollection = collection(db, "savedOffers");
    
    // ראשית, בואי נראה מה יש במסד הנתונים
    const allSavedOffersSnapshot = await getDocs(savedOffersCollection);
    console.log("כל ההמלצות השמורות במסד הנתונים:");
    allSavedOffersSnapshot.docs.forEach(doc => {
      console.log("מסמך:", doc.id, "נתונים:", doc.data());
    });
    
    // בואי נבדוק גם מה יש בקולקשן ההמלצות
    const recommendationsCollection = collection(db, "recommendations");
    const allRecommendationsSnapshot = await getDocs(recommendationsCollection);
    console.log("כל ההמלצות במסד הנתונים:");
    allRecommendationsSnapshot.docs.forEach(doc => {
      console.log("המלצה:", doc.id, "נתונים:", doc.data());
    });
    
    const q = query(
      savedOffersCollection, 
      where("userId", "==", userId),
      where("saved", "==", true)
    );
    const savedOffersSnapshot = await getDocs(q);
    
    console.log("נמצאו", savedOffersSnapshot.docs.length, "המלצות שמורות עבור המשתמש");
    
    // Get the actual recommendation details for each saved offer
    const savedOffers = savedOffersSnapshot.docs.map(doc => {
      const data = doc.data();
      console.log("המלצה שמורה:", { id: doc.id, ...data });
      return { id: doc.id, ...data as any };
    });
    
    const recommendationsWithDetails = await Promise.all(
      savedOffers.map(async (offer: any) => {
        console.log("מחפש פרטי המלצה:", offer.recommendationId);
        
        // חיפוש לפי מזהה המותאם אישית בשדה id של המסמך
        const recommendationsCollection = collection(db, "recommendations");
        const q = query(recommendationsCollection, where("id", "==", offer.recommendationId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const recommendationDoc = querySnapshot.docs[0];
          const recommendationData = recommendationDoc.data();
          console.log("נמצאו פרטי המלצה:", recommendationData);
          return {
            ...offer,
            recommendation: { id: recommendationDoc.id, ...recommendationData }
          };
        } else {
          // אם לא מצאנו לפי שדה id, ננסה לפי מזהה המסמך
          try {
            const recommendationDoc = await getDoc(doc(db, "recommendations", offer.recommendationId));
            if (recommendationDoc.exists()) {
              const recommendationData = recommendationDoc.data();
              console.log("נמצאו פרטי המלצה בשיטה השנייה:", recommendationData);
              return {
                ...offer,
                recommendation: { id: recommendationDoc.id, ...recommendationData }
              };
            }
          } catch (error) {
            console.error("שגיאה בחיפוש לפי מזהה מסמך:", error);
          }
          
          console.log("לא נמצאו פרטי המלצה עבור:", offer.recommendationId);
          
          // במקום למחוק, נחזיר את ההמלצה השמורה עם פרטים בסיסיים
          return {
            ...offer,
            recommendation: { 
              id: offer.recommendationId, 
              businessName: "עסק לא ידוע",
              description: "המלצה שמורה",
              discount: "הנחה",
              rating: 5,
              imageUrl: null,
              validUntil: "לא ידוע"
            }
          };
        }
      })
    );
    
    // סנן את ההמלצות השמורות שהן null (לא קיימות יותר)
    const validRecommendationsWithDetails = recommendationsWithDetails.filter(item => item !== null);
    
    console.log("תוצאה סופית:", validRecommendationsWithDetails);
    return validRecommendationsWithDetails;
  } catch (error) {
    console.error("Error getting saved offers: ", error);
    throw error;
  }
};

export const claimOffer = async (offerId: string, referrerId: string) => {
  try {
    // Mark offer as claimed
    const offerRef = doc(db, "savedOffers", offerId);
    await updateDoc(offerRef, {
      claimed: true,
      claimedAt: serverTimestamp()
    });
    
    // Add coins to referrer
    const userRef = doc(db, "users", referrerId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      await updateDoc(userRef, {
        coins: (userData.coins || 0) + 5,
        referrals: (userData.referrals || 0) + 1
      });
    }
  } catch (error) {
    console.error("Error claiming offer: ", error);
    throw error;
  }
};

export const uploadImage = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image: ", error);
    throw error;
  }
};

// Get site configuration
export const getSiteConfig = async () => {
  try {
    const configDoc = await getDoc(doc(db, "siteconfig", "general"));
    if (configDoc.exists()) {
      return configDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting site config: ", error);
    throw error;
  }
};

// Get logo from site configuration
export const getLogoURL = async () => {
  try {
    // קריאה לקולקשן siteConfig כדי לקבל את הלוגו
    const configDoc = await getDoc(doc(db, "siteConfig", "main"));
    if (configDoc.exists()) {
      const data = configDoc.data();
      if (data.logoUrl) {
        return data.logoUrl;
      }
    }
    
    // אם אין לוגו במסד הנתונים, השתמש ב-URL הספציפי מ-Firebase Storage
    return "https://firebasestorage.googleapis.com/v0/b/shareit-454f0.firebasestorage.app/o/images%2FLogo3.png?alt=media&token=63561733-5bb8-4dcb-bb88-ecdb2948d5d9";
  } catch (error) {
    console.error("Error getting logo URL:", error);
    // במקרה של שגיאה, החזר את ה-URL הקבוע
    return "https://firebasestorage.googleapis.com/v0/b/shareit-454f0.firebasestorage.app/o/images%2FLogo3.png?alt=media&token=63561733-5bb8-4dcb-bb88-ecdb2948d5d9";
  }
};

export { auth, db, storage };
