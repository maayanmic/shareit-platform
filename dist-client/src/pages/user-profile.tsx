import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { getUserRating, createConnection, getUserData, getUserRecommendations, rateRecommendation, checkConnection } from "@/lib/firebase-update";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Star, StarHalf, UserPlus, Check, AlertCircle, Info, Heart, Users } from "lucide-react";
import RecommendationCard from "@/components/recommendation/recommendation-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { saveOffer } from "@/lib/firebase";

// רכיב לכרטיס המלצה בדף המשתמש
interface UserRecommendationCardProps {
  id: string;
  businessName: string;
  businessImage: string;
  description: string;
  rating: number;
  savedCount: number;
  onRateRecommendation: (id: string, rating: number) => void;
  canRate: boolean;
}

function UserRecommendationCard({
  id,
  businessName,
  businessImage,
  description,
  rating,
  savedCount,
  onRateRecommendation,
  canRate
}: UserRecommendationCardProps) {
  const [currentRating, setCurrentRating] = useState(rating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSaveOffer = async () => {
    // נסה לקבל את המשתמש מ-user או מ-localStorage
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

    if (!currentUser) {
      toast({
        title: "שגיאה",
        description: "צריך להיות מחובר כדי לשמור המלצות",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(`מנסה לשמור המלצה: userId=${currentUser.uid}, recommendationId=${id}`);
      await saveOffer(currentUser.uid, id);
      setSaved(true);
      console.log("ההמלצה נשמרה בהצלחה");
      toast({
        title: "נשמר!",
        description: "ההמלצה נשמרה בהצלחה",
      });
    } catch (error) {
      console.error("שגיאה בשמירת ההמלצה:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את ההמלצה כעת",
        variant: "destructive",
      });
    }
  };

  const handleRating = (newRating: number) => {
    if (!canRate) return;
    setCurrentRating(newRating);
    onRateRecommendation(id, newRating);
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        {/* תמונת העסק */}
        {businessImage && (
          <div className="aspect-video mb-4 rounded-lg overflow-hidden">
            <img 
              src={businessImage} 
              alt={businessName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=400&auto=format&fit=crop";
              }}
            />
          </div>
        )}
        
        {/* שם העסק */}
        <h3 className="font-semibold text-lg mb-2 text-right">{businessName}</h3>
        
        {/* תיאור ההמלצה */}
        <div className="text-right mb-4" dir="rtl">
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 leading-relaxed">
            {description}
          </p>
        </div>
        
        {/* דירוג אינטראקטיבי */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`transition-colors ${canRate ? 'cursor-pointer' : 'cursor-default'}`}
                onMouseEnter={() => canRate && setHoveredRating(star)}
                onMouseLeave={() => canRate && setHoveredRating(0)}
                onClick={() => handleRating(star)}
                disabled={!canRate}
              >
                <Star
                  className={`h-5 w-5 ${
                    star <= (hoveredRating || Math.round(currentRating))
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          
          {/* כפתור שמירה */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveOffer}
            disabled={saved}
            className="h-9 px-3 flex items-center gap-2"
          >
            <Heart className={`h-5 w-5 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="text-sm">שמירה</span>
          </Button>
        </div>
        
        {/* מספר שמירות */}
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          <span>{savedCount} שמירות</span>
        </div>
      </CardContent>
    </Card>
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
      
      // עדכון הדירוג ברשימה המקומית
      setRecommendations(prev => prev.map(rec => 
        rec.id === recommendationId ? { ...rec, rating } : rec
      ));

      toast({
        title: "תודה!",
        description: "הדירוג נשמר בהצלחה",
      });
    } catch (error) {
      console.error("שגיאה בדירוג המלצה:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את הדירוג כעת",
        variant: "destructive",
      });
    }
  };
  
  // טעינת פרטי המשתמש
  useEffect(() => {
    async function fetchUserProfile() {
      if (!userId) return;
      
      try {
        setLoading(true);
        setError(null);
        setDebugInfo(null);
        
        console.log(`מתחיל טעינת פרופיל משתמש עבור: ${userId}`);
        
        // טעינת פרטי המשתמש
        const userData = await getUserData(userId);
        if (!userData) {
          console.error(`לא נמצא משתמש עם המזהה: ${userId}`);
          setError("לא נמצא משתמש עם המזהה שצוין");
          
          toast({
            title: "שגיאה",
            description: "לא נמצא משתמש עם המזהה שצוין",
            variant: "destructive",
          });
          return;
        }
        
        console.log(`פרטי המשתמש שנמצאו:`, userData);
        setProfileUser(userData);
        
        // טעינת דירוג המשתמש
        const rating = await getUserRating(userId);
        console.log(`דירוג המשתמש:`, rating);
        setUserRating(rating);
        
        // בדיקת מצב החיבור הנוכחי ישירות מהמסד נתונים
        if (user) {
          console.log(`בודק חיבור עבור משתמש מחובר: ${user.uid} -> ${userId}`);
          const connectionExists = await checkConnection(user.uid, userId);
          console.log(`תוצאת בדיקת החיבור: ${connectionExists}`);
          setIsConnectedState(connectionExists);
        } else {
          console.log("לא נמצא משתמש מחובר - לא ניתן לבדוק חיבורים");
          // נסה לקבל את המשתמש מ-localStorage כפתרון זמני
          const storedUser = localStorage.getItem('authUser');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              console.log(`נמצא משתמש בלוקל סטורג': ${parsedUser.uid}`);
              const connectionExists = await checkConnection(parsedUser.uid, userId);
              console.log(`תוצאת בדיקת החיבור מלוקל סטורג': ${connectionExists}`);
              setIsConnectedState(connectionExists);
            } catch (e) {
              console.error("שגיאה בפענוח נתוני משתמש מלוקל סטורג':", e);
            }
          }
        }
        
        // טעינת ההמלצות של המשתמש
        console.log(`מתחיל טעינת המלצות עבור משתמש: ${userId}`);
        try {
          const userRecommendations = await getUserRecommendations(userId);
          console.log(`התקבלו ${userRecommendations.length} המלצות למשתמש`);
          
          if (userRecommendations.length > 0) {
            console.log(`דוגמה להמלצה ראשונה:`, userRecommendations[0]);
            setDebugInfo(userRecommendations[0]);
          }
          
          setRecommendations(userRecommendations);
        } catch (recError: any) {
          console.error("שגיאה בטעינת המלצות:", recError);
          setError(`שגיאה בטעינת המלצות: ${recError.message || 'שגיאה לא ידועה'}`);
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
      <div className="flex items-center">
        {Array(fullStars).fill(0).map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <StarHalf className="h-5 w-5 fill-yellow-400 text-yellow-400" />}
        {Array(5 - fullStars - (hasHalfStar ? 1 : 0)).fill(0).map((_, i) => (
          <Star key={i} className="h-5 w-5 text-gray-300" />
        ))}
      </div>
    );
  };
  
  // בדיקה אם המשתמש הנוכחי כבר מחובר למשתמש שבפרופיל
  const isConnected = () => {
    if (!user || !profileUser || !userId) return false;
    
    // בדוק אם המשתמש הנוכחי מחובר למשתמש שבפרופיל
    return user.connections?.includes(userId) || false;
  };
  
  // מחשב פעם אחת האם המשתמש מחובר
  const connectedToProfile = isConnectedState;
  
  // בדיקה אם המשתמש הנוכחי צופה בפרופיל שלו עצמו
  const isOwnProfile = () => {
    if (!user || !userId) return false;
    return user.uid === userId;
  };
  
  // מחשב פעם אחת האם זה הפרופיל העצמי
  const ownProfile = isOwnProfile();
  
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex-1 space-y-4 w-full">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!profileUser) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">המשתמש לא נמצא</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            לא ניתן למצוא משתמש עם המזהה שצוין.
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            חזרה לעמוד הקודם
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      {/* כרטיס פרופיל */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
          {/* תמונת הפרופיל */}
          <div className="w-16 h-16">
            <img 
              src={profileUser.photoURL || `https://avatars.dicebear.com/api/initials/${profileUser.displayName}.svg`} 
              alt={profileUser.displayName} 
              className="w-full h-full rounded-full object-cover border-2 border-primary-100"
            />
          </div>
          
          {/* מידע על המשתמש */}
          <div className="flex-1 flex flex-col items-center md:items-start">
            <h1 className="text-xl font-semibold mb-1">{profileUser.displayName}</h1>
            
            {/* דירוג */}
            <div className="mb-3">{renderRating(userRating)}</div>
            
            {/* ביו */}
            {profileUser.bio && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 max-w-2xl">
                {profileUser.bio}
              </p>
            )}
            
            {/* כפתור התחברות - לא מוצג אם זה הפרופיל של המשתמש עצמו */}
            {!ownProfile && (
              connectedToProfile ? (
                <Button variant="outline" disabled className="text-green-600">
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
      
      {/* מידע על ההמלצות - מוסתר */}
      <div className="mb-4 hidden">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>מידע אבחון</AlertTitle>
          <AlertDescription>
            מספר המלצות: {recommendations.length}
          </AlertDescription>
        </Alert>
      </div>
      
      {/* רשימת המלצות */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-right">המלצות של {profileUser.displayName}</h2>
        
        {/* אם יש מידע אבחון, נציג אותו - מוסתר */}
        {debugInfo && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-4 hidden">
            <h3 className="text-lg font-semibold mb-2 text-right">מידע אבחון על המלצה ראשונה:</h3>
            <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs overflow-auto text-right" dir="ltr">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
        
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
            {recommendations.map((recommendation, index) => {
              try {
                const businessName = recommendation.businessName || "עסק";
                const businessImage = recommendation.businessImage || recommendation.imageUrl || "";
                const description = recommendation.description || recommendation.text || "המלצה על עסק זה";
                const rating = recommendation.rating || 0;
                const savedCount = recommendation.savedCount || 0;
                
                // המרת שדה validUntil לפורמט תאריך תקין אם צריך
                let formattedValidUntil = "ללא הגבלה";
                
                if (recommendation.validUntil) {
                  if (typeof recommendation.validUntil === 'object' && 'seconds' in recommendation.validUntil) {
                    // המרה מאובייקט Timestamp של Firestore
                    const date = new Date(recommendation.validUntil.seconds * 1000);
                    formattedValidUntil = date.toLocaleDateString('he-IL');
                  } else if (recommendation.validUntil instanceof Date) {
                    // אם זה אובייקט Date רגיל
                    formattedValidUntil = recommendation.validUntil.toLocaleDateString('he-IL');
                  } else {
                    // אם זה כבר מחרוזת, השתמש בה כמו שהיא
                    formattedValidUntil = String(recommendation.validUntil);
                  }
                }
                
                return (
                  <div key={recommendation.id || index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
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
                            onClick={() => {
                              // כאן נוסיף פונקציה לשמירת ההמלצה
                              console.log("שמירת המלצה:", recommendation.id);
                            }}
                          >
                            <Heart className="h-3 w-3" />
                            <span className="text-xs">שמירה</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } catch (err) {
                console.error(`שגיאה בהמלצה ${index}:`, err, recommendation);
                return (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
                    <p className="text-red-500 text-center">שגיאה בהצגת המלצה זו</p>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}