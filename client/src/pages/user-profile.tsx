import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { getUserRating, createConnection, getUserData, getUserRecommendations, checkConnection, rateRecommendation } from "@/lib/firebase-update";
import { saveOffer, getSavedOffers } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Star, StarHalf, UserPlus, Check, AlertCircle, Info, Heart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SimpleRecommendationCardProps {
  recommendation: any;
  user: any;
  toast: any;
  onRatingUpdate?: (recommendationId: string, newRating: number) => void;
}

function SimpleRecommendationCard({ recommendation, user, toast, onRatingUpdate }: SimpleRecommendationCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  
  const businessName = recommendation.businessName || recommendation.name || "עסק";
  const description = recommendation.description || recommendation.text || "המלצה מעולה";
  const businessImage = recommendation.businessImage || recommendation.image || recommendation.imageUrl;
  const discount = recommendation.discount || "הנחה מיוחדת";
  const validUntil = recommendation.validUntil;
  
  // דירוג אישי של המשתמש הנוכחי לההמלצה הזו
  // אם אין שדה ratings (המלצות ישנות), אז אין דירוג אישי
  const myRating = user && recommendation.ratings && recommendation.ratings[user.uid] 
    ? recommendation.ratings[user.uid] 
    : 0;
  
  let formattedValidUntil = "ללא הגבלה";
  if (validUntil && validUntil instanceof Date) {
    formattedValidUntil = validUntil.toLocaleDateString('he-IL');
  } else if (validUntil && typeof validUntil === 'string') {
    try {
      const date = new Date(validUntil);
      if (!isNaN(date.getTime())) {
        formattedValidUntil = date.toLocaleDateString('he-IL');
      }
    } catch (e) {
      console.warn("Invalid date format:", validUntil);
    }
  }

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
      console.log(`דירוג המלצה ${recommendationId} ב-${rating} כוכבים`);
      await rateRecommendation(recommendationId, rating, user.uid);
      
      if (onRatingUpdate) {
        onRatingUpdate(recommendationId, rating);
      }
      
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

  // בדוק אם ההמלצה שמורה בטעינה
  useEffect(() => {
    async function checkIfSaved() {
      if (user && recommendation && recommendation.id) {
        const saved = await getSavedOffers(user.uid);
        const found = saved.some((offer: any) => offer.recommendationId === recommendation.id);
        setIsSaved(found);
      }
    }
    checkIfSaved();
  }, [user, recommendation]);

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "נדרש לוגין",
        description: "צריך להיות מחובר כדי לשמור המלצות",
        variant: "destructive",
      });
      return;
    }
    try {
      await saveOffer(user.uid, recommendation.id);
      setIsSaved(true);
      toast({
        title: "נשמר בהצלחה",
        description: `ההמלצה נשמרה באיזור האישי שלך`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "שגיאה בשמירה",
        description: "לא ניתן לשמור את ההמלצה. אנא נסה שוב מאוחר יותר.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* תמונת העסק */}
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700">
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
      
      {/* תוכן הכרטיס */}
      <div className="p-4">
        <h3 className="font-medium text-lg mb-2 text-right">{businessName}</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-right">
          <p className="mb-1">
            <span className="text-green-600 font-medium">{discount}</span>
          </p>
          <p className="leading-relaxed">
            {description}
          </p>
        </div>
        
        {/* דירוג ושמירה */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            {/* הדירוג האישי שלי */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((starNumber) => (
                <button
                  key={`my-star-${recommendation.id}-${starNumber}`}
                  type="button"
                  className="border-none bg-transparent p-0 m-0 outline-none focus:outline-none cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => {
                    if (!user) {
                      toast({
                        title: "נדרש לוגין",
                        description: "צריך להיות מחובר כדי לדרג המלצות",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    handleRateRecommendation(recommendation.id, starNumber);
                  }}
                >
                  <Star
                    className={`h-4 w-4 ${
                      starNumber <= myRating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            
            {/* הדירוג הכללי של ההמלצה */}
            {recommendation.rating && recommendation.rating > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">ממוצע:</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((starNumber) => (
                    <Star
                      key={`avg-star-${recommendation.id}-${starNumber}`}
                      className={`h-3 w-3 ${
                        starNumber <= (recommendation.rating || 0)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">({recommendation.rating})</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="h-8 px-2 flex items-center gap-1"
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

  const handleRateRecommendation = async (recommendationId: string, newRating: number) => {
    if (!user) {
      toast({
        title: "שגיאה",
        description: "צריך להיות מחובר כדי לדרג המלצות",
        variant: "destructive",
      });
      return;
    }

    try {
      await rateRecommendation(recommendationId, newRating, user.uid);
      
      // עדכון מקומי - טעינה מחדש של ההמלצות עם הדירוגים המעודכנים
      const userRecommendations = await getUserRecommendations(userId || '');
      setRecommendations(userRecommendations);
      
      // חישוב דירוג המשתמש מחדש
      const userRating = await getUserRating(userId || '');
      setUserRating(userRating);
      
      toast({
        title: "דירוג נשמר",
        description: `דירגת את ההמלצה ב-${newRating} כוכבים`,
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
      
      setIsConnectedState(true);
    } catch (error) {
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

  if (!profileUser) {
    return null;
  }

  let photoURL = profileUser.photoURL;
  if (!photoURL && profileUser.providerData) {
    const fbProvider = profileUser.providerData.find((p: any) => p.providerId === "facebook.com");
    if (fbProvider && fbProvider.uid) {
      photoURL = `https://graph.facebook.com/${fbProvider.uid}/picture?type=large`;
    }
  }

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

  if (error || !profileUser) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">שגיאה בטעינת הפרופיל</h1>
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
              {photoURL ? (
                <img 
                  src={photoURL}
                  alt={profileUser.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-sm">
                    {profileUser.displayName?.charAt(0) || "U"}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* פרטי המשתמש */}
          <div className="flex-1 text-center md:text-right">
            <h1 className="text-2xl font-bold mb-2">{profileUser.displayName || "משתמש"}</h1>
            
            {/* דירוג המשתמש */}
            <div className="flex items-center justify-center md:justify-end gap-2 mb-3">
              {renderRating(userRating)}
              {userRating > 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({userRating.toFixed(1)})
                </span>
              )}
            </div>
            
            {/* כפתור חיבור */}
            {!ownProfile && user && (
              isConnectedState ? (
                <Button disabled className="text-green-600">
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
        
        <div className="mb-2 text-sm text-gray-600">
          מספר המלצות: {recommendations.length}
        </div>
        
        

        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">אין המלצות להצגה כעת</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((recommendation, index) => (
              <SimpleRecommendationCard
                key={`${recommendation.id || recommendation.firestoreId || 'rec'}-${index}`}
                recommendation={recommendation}
                user={user}
                toast={toast}
                onRatingUpdate={handleRateRecommendation}
              />
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
}