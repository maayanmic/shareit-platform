import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { getUserRating, createConnection, getUserData, getUserRecommendations } from "@/lib/firebase-update";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Star, StarHalf, UserPlus, Check, AlertCircle, Info } from "lucide-react";
import RecommendationCard from "@/components/recommendation/recommendation-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function UserProfile() {
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [userRating, setUserRating] = useState(0);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
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
        } catch (recError) {
          console.error("שגיאה בטעינת המלצות:", recError);
          setError(`שגיאה בטעינת המלצות: ${(recError as any).message}`);
        }
      } catch (error) {
        console.error("שגיאה בטעינת פרופיל המשתמש:", error);
        setError(`שגיאה כללית: ${(error as any).message}`);
        
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
      
      // עדכון פרטי המשתמש בקומפוננטה כך שהלחצן יתעדכן
      setProfileUser((prevUser: any) => ({
        ...prevUser,
        isConnected: true
      }));
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
  const connectedToProfile = isConnected();
  
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* תמונת הפרופיל */}
          <div className="w-20 h-20">
            <img 
              src={profileUser.photoURL || `https://avatars.dicebear.com/api/initials/${profileUser.displayName}.svg`} 
              alt={profileUser.displayName} 
              className="w-full h-full rounded-full object-cover border-2 border-primary-100"
            />
          </div>
          
          {/* מידע על המשתמש */}
          <div className="flex-1 flex flex-col items-center md:items-start">
            <h1 className="text-2xl font-semibold mb-1">{profileUser.displayName}</h1>
            
            {/* דירוג */}
            <div className="mb-3">{renderRating(userRating)}</div>
            
            {/* ביו */}
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 max-w-2xl">
              {profileUser.bio || "משתמש במערכת ShareIt"}
            </p>
            
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
      
      {/* מידע על ההמלצות - רק למפתחים */}
      <div className="mb-4">
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
        
        {/* אם יש מידע אבחון, נציג אותו */}
        {debugInfo && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-4">
            <h3 className="text-lg font-semibold mb-2 text-right">מידע אבחון על המלצה ראשונה:</h3>
            <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs overflow-auto text-right" dir="ltr">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
        
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((recommendation, index) => {
              try {
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
                
                // וידוא שכל השדות הנדרשים קיימים ויש להם ערכי ברירת מחדל
                const businessName = recommendation.businessName || recommendation.name || "עסק";
                const businessImage = recommendation.businessImage || recommendation.imageUrl || recommendation.image || "https://via.placeholder.com/300";
                const description = recommendation.description || recommendation.text || "המלצה על עסק זה";
                const discount = recommendation.discount || "10%";
                const rating = typeof recommendation.rating === "number" ? recommendation.rating : Number(recommendation.rating || 4.5);
                const savedCount = typeof recommendation.savedCount === "number" ? recommendation.savedCount : Number(recommendation.savedCount || 0);
                const recommenderName = recommendation.userName || recommendation.userDisplayName || profileUser.displayName;
                const recommenderPhoto = recommendation.userPhotoURL || profileUser.photoURL || `https://avatars.dicebear.com/api/initials/${profileUser.displayName}.svg`;
                const recommenderId = recommendation.userId || recommendation.recommenderId || profileUser.id;
                
                return (
                  <RecommendationCard
                    key={recommendation.id || index}
                    id={recommendation.id || `rec-${index}`}
                    businessName={businessName}
                    businessImage={businessImage}
                    description={description}
                    discount={discount}
                    rating={rating}
                    recommenderName={recommenderName}
                    recommenderPhoto={recommenderPhoto}
                    recommenderId={recommenderId}
                    validUntil={formattedValidUntil}
                    savedCount={savedCount}
                  />
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