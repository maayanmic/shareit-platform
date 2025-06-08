import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { getUserRating, createConnection, getUserData, getUserRecommendations, rateRecommendation, checkConnection } from "@/lib/firebase-update";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Star, StarHalf, UserPlus, Check, AlertCircle, Info, Heart, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { saveOffer } from "@/lib/firebase";

// רכיב פשוט להמלצה עם כפתור שמירה
interface SimpleRecommendationCardProps {
  recommendation: any;
  user: any;
  toast: any;
}

function SimpleRecommendationCard({ recommendation, user, toast }: SimpleRecommendationCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  
  const businessName = recommendation.businessName || "עסק";
  const businessImage = recommendation.businessImage || recommendation.imageUrl || "";
  const description = recommendation.description || recommendation.text || "המלצה על עסק זה";
  const rating = recommendation.rating || 0;
  const savedCount = recommendation.savedCount || 0;
  
  // המרת שדה validUntil לפורמט תאריך תקין אם צריך
  let formattedValidUntil = "ללא הגבלה";
  
  if (recommendation.validUntil) {
    if (typeof recommendation.validUntil === 'object' && 'seconds' in recommendation.validUntil) {
      const date = new Date(recommendation.validUntil.seconds * 1000);
      formattedValidUntil = date.toLocaleDateString('he-IL');
    } else if (recommendation.validUntil instanceof Date) {
      formattedValidUntil = recommendation.validUntil.toLocaleDateString('he-IL');
    } else {
      formattedValidUntil = String(recommendation.validUntil);
    }
  }

  const handleSave = async () => {
    console.log("שמירת המלצה:", recommendation.id);
    
    let currentUser = user;
    if (!currentUser) {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        try {
          currentUser = JSON.parse(storedUser);
        } catch (e) {
          console.error("שגיאה בפענוח נתוני משתמש:", e);
        }
      }
    }

    if (!currentUser || !currentUser.uid) {
      toast({
        title: "שגיאה",
        description: "צריך להיות מחובר כדי לשמור המלצות",
        variant: "destructive",
      });
      return;
    }

    if (isSaved) {
      console.log("ההמלצה כבר שמורה");
      return;
    }

    try {
      setIsSaved(true);
      await saveOffer(currentUser.uid, recommendation.id);
      
      window.dispatchEvent(new CustomEvent('offerSaved', { 
        detail: { recommendationId: recommendation.id } 
      }));
      
      toast({
        title: "נשמר!",
        description: "ההמלצה נשמרה בהצלחה",
      });
    } catch (error) {
      console.error("שגיאה בשמירת ההמלצה:", error);
      setIsSaved(false);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את ההמלצה כעת",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* תמונת העסק */}
      <div className="aspect-video bg-gray-200 dark:bg-gray-700">
        {businessImage ? (
          <img 
            src={businessImage} 
            alt={businessName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=400&auto=format&fit=crop";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-500 text-sm">{businessName}</span>
          </div>
        )}
      </div>
      
      <div className="p-3">
        {/* שם העסק */}
        <h3 className="font-semibold text-base mb-1 text-right">{businessName}</h3>
        
        {/* תיאור ההמלצה */}
        <div className="text-right mb-3" dir="rtl">
          <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
        
        {/* דירוג ושמירה */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="h-3 w-3" />
              <span>{savedCount}</span>
            </div>
            
            {/* כפתור שמירה */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-1 flex items-center gap-1"
              onClick={handleSave}
              disabled={isSaved}
            >
              <Heart className={`h-3 w-3 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="text-xs">{isSaved ? 'נשמר' : 'שמירה'}</span>
            </Button>
          </div>
        </div>
        
        {/* תוקף ההמלצה */}
        {formattedValidUntil && formattedValidUntil !== "ללא הגבלה" && (
          <div className="text-xs text-gray-500 mt-1 text-right">
            תוקף עד: {formattedValidUntil}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserProfile() {
  const { userId } = useParams();
  console.log("UserProfile נטען עם userId:", userId);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [userRating, setUserRating] = useState(0);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isConnectedState, setIsConnectedState] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // פונקציה לטיפול בדירוג המלצה
  const handleRateRecommendation = async (recommendationId: string, rating: number) => {
    if (!user) {
      toast({
        title: "שגיאה",
        description: "צריך להיות מחובר כדי לדרג המלצות",
        variant: "destructive",
      });
      return;
    }

    try {
      await rateRecommendation(recommendationId, rating, user.uid);
      
      // עדכון מקומי של הדירוג בהמלצה
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === recommendationId 
            ? { ...rec, rating: rating }
            : rec
        )
      );
      
      toast({
        title: "דירוג נשמר",
        description: `דירגת את ההמלצה ב-${rating} כוכבים`,
        variant: "default",
      });
    } catch (error) {
      console.error("שגיאה בדירוג המלצה:", error);
      toast({
        title: "שגיאה בדירוג",
        description: "לא ניתן לשמור את הדירוג כעת",
        variant: "destructive",
      });
    }
  };

  const ownProfile = user && userId === user.uid;

  useEffect(() => {
    async function fetchUserProfile() {
      if (!userId) {
        setError("מזהה משתמש לא נמצא");
        setLoading(false);
        return;
      }

      try {
        console.log(`טוען פרופיל משתמש: ${userId}`);
        setError(null);
        setLoading(true);

        // בדיקת חיבור עם המשתמש הנוכחי
        let isConnected = false;
        if (user && user.uid !== userId) {
          try {
            isConnected = await checkConnection(user.uid, userId);
            console.log(`מצב חיבור עם משתמש ${userId}:`, isConnected);
            setIsConnectedState(isConnected);
          } catch (connError) {
            console.error("שגיאה בבדיקת חיבור:", connError);
          }
        }

        // טעינת נתוני המשתמש
        const userData = await getUserData(userId);
        console.log("נתוני משתמש נטענו:", userData);

        if (!userData) {
          setError("משתמש לא נמצא");
          return;
        }

        setProfileUser(userData);

        // טעינת דירוג המשתמש
        try {
          const rating = await getUserRating(userId);
          console.log(`דירוג משתמש ${userId}:`, rating);
          setUserRating(rating);
        } catch (ratingError) {
          console.error("שגיאה בטעינת דירוג:", ratingError);
          setUserRating(0);
        }

        // טעינת המלצות המשתמש
        try {
          const userRecommendations = await getUserRecommendations(userId);
          console.log(`המלצות משתמש ${userId}:`, userRecommendations);
          setRecommendations(userRecommendations);
          
          if (userRecommendations.length > 0) {
            setDebugInfo(userRecommendations[0]);
          }
        } catch (recError) {
          console.error("שגיאה בטעינת המלצות:", recError);
          setRecommendations([]);
        }

      } catch (error: any) {
        console.error("שגיאה בטעינת פרופיל המשתמש:", error);
        setError(`שגיאה כללית: ${error.message || 'שגיאה לא ידועה'}`);
        
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת פרופיל המשתמש",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserProfile();
  }, [userId, toast]);
  
  // פונקציה ליצירת חיבור עם המשתמש
  const handleConnect = async () => {
    if (!user || !userId) return;
    
    try {
      setConnecting(true);
      await createConnection(user.uid, userId);
      
      toast({
        title: "נוצר חיבור בהצלחה",
        description: "כעת תראה את ההמלצות של משתמש זה",
        variant: "default",
      });
      
      // עדכון מצב החיבור המקומי
      setIsConnectedState(true);
    } catch (error: any) {
      console.error("שגיאה ביצירת חיבור:", error);
      toast({
        title: "שגיאה ביצירת חיבור",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };
  
  // פונקציה להצגת דירוג המשתמש בכוכבים (ללא מספר)
  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />;
          }
          if (i === fullStars && hasHalfStar) {
            return <StarHalf key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />;
          }
          return <Star key={i} className="h-5 w-5 text-gray-300" />;
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-lg">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md">
          <h2 className="text-2xl font-bold mb-4">משתמש לא נמצא</h2>
          <p className="text-gray-600 dark:text-gray-400">
            לא הצלחנו למצוא את המשתמש המבוקש
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* פרופיל המשתמש */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* תמונת פרופיל */}
          <div className="text-center md:text-right">
            <div className="w-24 h-24 mx-auto md:mx-0 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              {profileUser.photoURL ? (
                <img 
                  src={profileUser.photoURL} 
                  alt={profileUser.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl font-bold">
                  {profileUser.displayName?.charAt(0) || '?'}
                </div>
              )}
            </div>
          </div>
          
          {/* פרטי המשתמש */}
          <div className="flex-1 text-center md:text-right">
            <h1 className="text-2xl font-bold mb-2">{profileUser.displayName}</h1>
            <div className="mb-4">
              {renderRating(userRating)}
            </div>
            
            {/* כפתור חיבור */}
            {user && !ownProfile && (
              isConnectedState ? (
                <Button 
                  variant="default" 
                  disabled 
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="ml-2 h-4 w-4" />
                  מחובר
                </Button>
              ) : (
                <Button 
                  onClick={handleConnect} 
                  disabled={connecting}
                >
                  <UserPlus className="ml-2 h-4 w-4" />
                  {connecting ? "מתחבר..." : "התחבר"}
                </Button>
              )
            )}
          </div>
        </div>
      </div>
      
      {/* הצגת שגיאות */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>שגיאה</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* רשימת המלצות */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-right">המלצות של {profileUser.displayName}</h2>
        
        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-end">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            מספר המלצות שהועלו: {recommendations.length}
          </p>
        </div>

        {recommendations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {ownProfile 
                ? "טרם שיתפת המלצות. סרוק קוד QR בעסק על מנת לשתף את ההמלצה הראשונה שלך!" 
                : `${profileUser.displayName} טרם שיתף המלצות.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((recommendation, index) => (
              <SimpleRecommendationCard
                key={recommendation.id || index}
                recommendation={recommendation}
                user={user}
                toast={toast}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}