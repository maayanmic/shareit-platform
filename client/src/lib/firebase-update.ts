import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  updateDoc,
  addDoc,
  serverTimestamp,
  limit
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeApp, getApps, getApp } from "firebase/app";

// Use the same Firebase configuration as in firebase.ts
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "placeholder-api-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "placeholder-project"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "placeholder-project",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "placeholder-project"}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "placeholder-messaging-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "placeholder-app-id"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// פונקציות לעבודה עם משתמשים וחיבורים
export const getUsers = async () => {
  try {
    const usersCollection = collection(db, "users");
    const querySnapshot = await getDocs(usersCollection);
    
    const users = [];
    for (const doc of querySnapshot.docs) {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    }
    
    console.log(`נטענו ${users.length} משתמשים מהמערכת`);
    return users;
  } catch (error) {
    console.error("שגיאה בהבאת המשתמשים:", error);
    throw error;
  }
};

export const createConnection = async (userId: string, targetUserId: string) => {
  try {
    // תעד את החיבור בקולקשן connections
    await addDoc(collection(db, "connections"), {
      userId: userId,
      targetUserId: targetUserId,
      createdAt: serverTimestamp()
    });

    // עדכן את שדה connections במשתמש שלך
    const userDoc = doc(db, "users", userId);
    const userSnapshot = await getDoc(userDoc);
    let userConnections: string[] = [];
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      userConnections = userData.connections || [];
      if (!userConnections.includes(targetUserId)) {
        userConnections = [...userConnections, targetUserId];
        await updateDoc(userDoc, {
          connections: userConnections,
          connectionsCount: userConnections.length
        });
      }
    }

    // עדכן את שדה connections במשתמש השני
    const targetUserDoc = doc(db, "users", targetUserId);
    const targetUserSnapshot = await getDoc(targetUserDoc);
    let targetConnections: string[] = [];
    if (targetUserSnapshot.exists()) {
      const targetData = targetUserSnapshot.data();
      targetConnections = targetData.connections || [];
      if (!targetConnections.includes(userId)) {
        targetConnections = [...targetConnections, userId];
        await updateDoc(targetUserDoc, {
          connections: targetConnections,
          connectionsCount: targetConnections.length
        });
      }
    }

    return true;
  } catch (error) {
    console.error("שגיאה ביצירת חיבור:", error);
    throw error;
  }
};

export const getUserRating = async (userId: string) => {
  try {
    console.log(`מחשב דירוג משתמש: ${userId}`);
    
    // הבא את כל ההמלצות של המשתמש
    const userRecommendations = await getUserRecommendations(userId);
    
    if (!userRecommendations || userRecommendations.length === 0) {
      console.log("לא נמצאו המלצות למשתמש");
      return 0;
    }
    
    let allRatings: number[] = [];
    let totalRatingsCount = 0;
    
    userRecommendations.forEach(recommendation => {
      if (recommendation.ratings && typeof recommendation.ratings === 'object') {
        // עבור על כל הדירוגים בהמלצה הזו
        Object.entries(recommendation.ratings).forEach(([raterUserId, rating]) => {
          // רק דירוגים מאחרים (לא מהמשתמש עצמו)
          if (raterUserId !== userId && typeof rating === 'number' && rating > 0) {
            allRatings.push(rating);
            totalRatingsCount++;
            console.log(`המלצה ${recommendation.id}: דירוג ${rating} מ-${raterUserId}`);
          }
        });
      }
    });
    
    if (allRatings.length === 0) {
      console.log("אין דירוגים מאחרים למשתמש");
      return 0;
    }
    
    const averageRating = allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length;
    const roundedRating = Number(averageRating.toFixed(1));
    
    console.log(`דירוג כללי של משתמש ${userId}: ${roundedRating} (מתוך ${totalRatingsCount} דירוגים מאחרים על ${userRecommendations.length} המלצות)`);
    
    return roundedRating;
  } catch (error) {
    console.error("שגיאה בחישוב דירוג המשתמש:", error);
    return 0;
  }
};

// פונקציה לדירוג המלצה
// בדיקה אם יש חיבור בין שני משתמשים
export const checkConnection = async (userId: string, targetUserId: string) => {
  try {
    console.log(`בודק חיבור בין ${userId} ל-${targetUserId}`);
    
    const connectionsRef = collection(db, 'connections');
    
    // בדיקה ראשונה - חיבור עם status
    const q1 = query(
      connectionsRef,
      where('userId', '==', userId),
      where('targetUserId', '==', targetUserId),
      where('status', '==', 'accepted')
    );
    
    const querySnapshot1 = await getDocs(q1);
    console.log(`תוצאה בבדיקה עם status:`, querySnapshot1.size);
    
    if (!querySnapshot1.empty) {
      console.log(`נמצא חיבור עם status accepted`);
      return true;
    }
    
    // בדיקה שנייה - חיבור ללא status (רקורדים ישנים)
    const q2 = query(
      connectionsRef,
      where('userId', '==', userId),
      where('targetUserId', '==', targetUserId)
    );
    
    const querySnapshot2 = await getDocs(q2);
    console.log(`תוצאה בבדיקה ללא status:`, querySnapshot2.size);
    
    if (!querySnapshot2.empty) {
      console.log(`נמצא חיבור ללא status`);
      return true;
    }
    
    console.log(`לא נמצא חיבור`);
    return false;
  } catch (error) {
    console.error('שגיאה בבדיקת חיבור:', error);
    return false;
  }
};

export const updateUserRating = async (userId: string, rating: number) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { rating });
};

export const rateRecommendation = async (recommendationId: string, rating: number, userId: string) => {
  try {
    console.log(`מדרג המלצה ${recommendationId} בדירוג ${rating} על ידי משתמש ${userId}`);
    // מוצא את ההמלצה במסד הנתונים
    const recommendationsRef = collection(db, "recommendations");
    const q = query(recommendationsRef, where("id", "==", recommendationId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      throw new Error("לא נמצאה המלצה עם המזהה שצוין");
    }
    const recommendationDoc = querySnapshot.docs[0];
    const currentData = recommendationDoc.data();
    // יצירת אובייקט דירוגים אם לא קיים
    const ratings = currentData.ratings || {};
    ratings[userId] = rating;
    // חישוב ממוצע דירוגים
    const ratingsArray = Object.values(ratings) as number[];
    const averageRating = ratingsArray.reduce((sum, r) => sum + r, 0) / ratingsArray.length;
    // עדכון ההמלצה עם הדירוג החדש
    await updateDoc(recommendationDoc.ref, {
      ratings: ratings,
      rating: Number(averageRating.toFixed(1)),
      lastRatedAt: serverTimestamp()
    });
    // --- עדכון ממוצע דירוגים של המשתמש (היוצר של ההמלצה) ---
    const creatorUserId = currentData.userId;
    if (creatorUserId) {
      // הבא את כל ההמלצות של המשתמש
      const userRecommendations = await getUserRecommendations(creatorUserId);
      let allRatings: number[] = [];
      userRecommendations.forEach(rec => {
        if (rec.ratings && typeof rec.ratings === 'object') {
          Object.entries(rec.ratings).forEach(([raterUserId, r]) => {
            if (raterUserId !== creatorUserId && typeof r === 'number' && r > 0) {
              allRatings.push(r);
            }
          });
        }
      });
      const userAvg = allRatings.length > 0 ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length : 0;
      await updateUserRating(creatorUserId, Number(userAvg.toFixed(1)));
    }
    // --- סוף עדכון ממוצע דירוגים ---
    console.log(`דירוג ההמלצה עודכן: ${rating} מ-${userId}, ממוצע חדש: ${averageRating.toFixed(1)}`);
    return true;
  } catch (error) {
    console.error("שגיאה בדירוג המלצה:", error);
    throw error;
  }
};

// פונקציה להבאת נתוני משתמש ספציפי
export const getUserData = async (userId: string) => {
  try {
    console.log(`מנסה להביא נתוני משתמש עבור: ${userId}`);
    
    // נסה להשתמש ב-userId כמזהה המסמך
    const userRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userRef);
    
    if (userSnapshot.exists()) {
      console.log(`מצאתי משתמש ישירות לפי ID: ${userId}`);
      const userData = userSnapshot.data();
      return {
        id: userSnapshot.id,
        ...userData
      };
    }
    
    // אם לא מצאנו, ננסה לחפש משתמש לפי שדה uid
    console.log("מנסה למצוא משתמש לפי uid במקום id...");
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("uid", "==", userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      console.log(`מצאתי משתמש לפי uid: ${userId}`);
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    }
    
    // לא מצאנו - עבור משתמש דמו אפשר להחזיר פרטים סטטיים
    if (userId === "demo_user1") {
      console.log("מחזיר פרטי משתמש דמו קבועים עבור:", userId);
      return {
        id: userId,
        uid: userId,
        displayName: "ישראל ישראלי",
        photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40",
        email: "demo@example.com",
        coins: 50,
        referrals: 3,
        savedOffers: 5
      };
    }
    
    console.log(`לא נמצא משתמש עבור: ${userId}`);
    return null;
  } catch (error) {
    console.error("שגיאה בהבאת נתוני משתמש:", error);
    return null;
  }
};

// פונקציה להבאת ההמלצות של משתמש ספציפי - משופרת לחיפוש בכל המקומות האפשריים
export const getUserRecommendations = async (userId: string) => {
  try {
    console.log(`מחפש המלצות עבור משתמש: "${userId}"`);
    
    // מאגר ההמלצות הסופי
    let foundRecommendations: any[] = [];
    const recommendationsRef = collection(db, "recommendations");
    
    // השיטה החדשה - נביא את כל ההמלצות (מוגבל ל-200) ונסנן אותן לאחר מכן לפי כל השדות האפשריים
    const allRecommendationsSnapshot = await getDocs(query(recommendationsRef, limit(200)));
    console.log(`נטענו ${allRecommendationsSnapshot.docs.length} המלצות לבדיקה`);
    
    // עבור על כל ההמלצות ומצא את אלו שקשורות למשתמש
    allRecommendationsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const recommendationId = doc.id;
      let isUserRecommendation = false;
      
      // בדיקת כל השדות האפשריים שיכולים להכיל את מזהה המשתמש
      const fieldsToCheck = [
        data.userId,
        data.recommenderId, 
        data.creatorId,
        data.user_id,
        data.authorId,
        data.uid,
        data.user?.id,
        data.user?.uid,
        data.recommender?.id,
        data.recommender?.uid,
        data.creator?.id,
        data.creator?.uid
      ];
      
      // אם אחד מהשדות הללו תואם את מזהה המשתמש, זו המלצה של המשתמש
      if (fieldsToCheck.includes(userId)) {
        isUserRecommendation = true;
        console.log(`נמצאה התאמה למשתמש ${userId} בהמלצה ${recommendationId}`);
      }
      
      // גם בדיקה של שדות מקוננים או מערכים
      if (
        (data.recommender && 
          (data.recommender.id === userId || data.recommender.uid === userId)) ||
        (data.creator && 
          (data.creator.id === userId || data.creator.uid === userId))
      ) {
        isUserRecommendation = true;
      }
      
      if (isUserRecommendation && !foundRecommendations.some(r => r.id === recommendationId)) {
        foundRecommendations.push({
          id: recommendationId,
          firestoreId: doc.id, // גם מזהה Firestore המקורי
          ...data
        });
      }
    });
    
    // השאילתות הספציפיות הוסרו כי הלולאה הכללית כבר מוצאת את כל ההמלצות
    
    // אם לא נמצאו המלצות - החזר מערך ריק בלי להדפיס הודעות
    if (foundRecommendations.length === 0) {
      console.log(`לא נמצאו המלצות למשתמש ${userId}`);
      return [];
    }
    
    console.log(`נמצאו ${foundRecommendations.length} המלצות למשתמש ${userId}`);
    
    // עיבוד ופורמט ההמלצות שנמצאו
    const formatted = formatRecommendations(foundRecommendations);
    console.log(`לאחר עיבוד: ${formatted.length} המלצות`);
    return formatted;
  } catch (error) {
    console.error("שגיאה בהבאת המלצות משתמש:", error);
    return [];
  }
};

// פונקציית עזר לפורמט ההמלצות - מטפלת בתאריכים ושדות חסרים
function formatRecommendations(recommendations: any[]) {
  return recommendations.map((recommendation: any) => {
    // 1. המרת שדה validUntil מאובייקט Timestamp למחרוזת אם הוא קיים
    if (recommendation.validUntil) {
      if (typeof recommendation.validUntil === 'object' && 'seconds' in recommendation.validUntil) {
        try {
          const date = new Date(recommendation.validUntil.seconds * 1000);
          recommendation.validUntil = date.toISOString();
        } catch (dateError) {
          console.error("Error converting date:", dateError);
          // אם יש שגיאה, קבע תאריך חדש
          recommendation.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        }
      }
    } else {
      // אם אין תאריך תקף, קבע תאריך עתידי של חודש
      recommendation.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }
    
    // 2. טיפול בשדות חסרים
    if (!recommendation.businessImage && recommendation.images && recommendation.images.length > 0) {
      recommendation.businessImage = recommendation.images[0];
    }
    
    if (!recommendation.businessName && recommendation.name) {
      recommendation.businessName = recommendation.name;
    }
    
    if (!recommendation.description && recommendation.text) {
      recommendation.description = recommendation.text;
    } else if (!recommendation.description && !recommendation.text) {
      recommendation.description = "המלצה על " + (recommendation.businessName || "עסק זה");
    }
    
    if (!recommendation.rating && recommendation.ratings) {
      recommendation.rating = recommendation.ratings;
    } else if (!recommendation.rating) {
      recommendation.rating = 4.5; // ברירת מחדל
    }
    
    if (!recommendation.savedCount) {
      recommendation.savedCount = Math.floor(Math.random() * 30) + 5; // ברירת מחדל
    }
    
    return recommendation;
  });
}

export const getUserConnections = async (userId: string) => {
  const connectionsRef = collection(db, 'connections');
  const q = query(connectionsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data().targetUserId);
};