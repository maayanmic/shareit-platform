import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getUserRecommendations, getSavedOffers } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Star, Heart, MessageCircle, Share2, Settings, Trophy, Coins } from "lucide-react";
import { Link } from "wouter";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function Profile() {
  const { user, logout } = useAuth();
  const [userRecommendations, setUserRecommendations] = useState<any[]>([]);
  const [savedOffers, setSavedOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      console.log("מזהה המשתמש הנוכחי:", user.uid);
      setLoading(true); // מתחיל טעינה מחדש
      
      try {
        // נקה קאש ישן
        setSavedOffers([]);
        setUserRecommendations([]);
        
        const [recommendations, offers] = await Promise.all([
          getUserRecommendations(user.uid),
          getSavedOffers(user.uid)
        ]);
        
        console.log("המלצות המשתמש:", recommendations);
        console.log("המלצות שמורות רענון:", offers);
        
        setUserRecommendations(recommendations);
        setSavedOffers(offers);
        

      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    
    // האזנה לאירוע שמירת המלצה חדשה
    const handleOfferSaved = () => {
      console.log("זוהה שמירת המלצה חדשה - מרענן נתונים");
      fetchUserData();
    };
    
    window.addEventListener('offerSaved', handleOfferSaved);
    
    return () => {
      window.removeEventListener('offerSaved', handleOfferSaved);
    };
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md">
          <h2 className="text-2xl font-bold mb-4">נדרש להתחבר</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            כדי לראות את הפרופיל שלך, אתה צריך להתחבר תחילה
          </p>
          <Link href="/login">
            <Button>התחבר עכשיו</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Fallback for Facebook photoURL
  let photoURL = user.photoURL;
  if (!photoURL && user.providerData) {
    const fbProvider = user.providerData.find((p: any) => p.providerId === "facebook.com");
    if (fbProvider && fbProvider.uid) {
      photoURL = `https://graph.facebook.com/${fbProvider.uid}/picture?type=large`;
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      {/* כותרת הפרופיל */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-white shadow-lg">
              <AvatarImage src={photoURL || ""} />
              <AvatarFallback className="text-2xl">
                {user.displayName?.slice(0, 2) || "U"}
              </AvatarFallback>
            </Avatar>
            <Button 
              size="sm" 
              variant="outline" 
              className="absolute -bottom-2 -right-2 rounded-full p-2 bg-white shadow-md"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 text-center md:text-right">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {user.displayName || "משתמש"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {user.email}
            </p>
            
            {/* סטטיסטיקות */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userRecommendations.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">המלצות</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {user.coins || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">מטבעות</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {savedOffers.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">הטבות</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Edit className="ml-2 h-4 w-4" />
                    עריכת פרופיל
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">יתווסף בעתיד</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Settings className="ml-2 h-4 w-4" />
                    הגדרות
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">יתווסף בעתיד</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* התוכן העיקרי */}
      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="recommendations" className="text-right">
            ההמלצות שלי
          </TabsTrigger>
          <TabsTrigger value="saved" className="text-right">
            ההטבות ששמרתי
          </TabsTrigger>
        </TabsList>

        {/* ההמלצות שלי */}
        <TabsContent value="recommendations">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-right">ההמלצות שלי</h2>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : userRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userRecommendations.map((rec) => (
                  <Card key={rec.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800">
                      {rec.imageUrl && (
                        <img 
                          src={rec.imageUrl} 
                          alt={rec.businessName}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-right">
                        {rec.businessName}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 text-left">
                        {rec.text || rec.description || "אין תיאור"}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary">{rec.discount}</Badge>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {rec.savedCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="h-4 w-4" />
                            שתף
                          </span>
                        </div>
                      </div>
                      
                      {rec.validUntil && rec.validUntil !== "ללא הגבלה" && (
                        <div className="text-sm text-gray-500 text-right">
                          תוקף עד: {rec.validUntil}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="text-center py-12 px-6 bg-white dark:bg-gray-800 rounded-xl shadow-md w-full max-w-lg">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">עדיין לא יצרת המלצות</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    התחל לשתף את החוויות שלך עם העולם
                  </p>
                  <Link href="/create-recommendation">
                    <Button>צור המלצה ראשונה</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* שמורים */}
        <TabsContent value="saved">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-right">ההטבות השמורות</h2>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : savedOffers && savedOffers.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  נמצאו {savedOffers.length} המלצות שמורות
                </div>
                {savedOffers.map((offer, index) => {
                  console.log("מציג המלצה שמורה:", offer);
                  console.log("נתוני ההמלצה:", offer.recommendation);
                  
                  if (!offer.recommendation) {
                    return (
                      <div key={`empty-${index}`} className="p-4 border border-gray-200 rounded-lg">
                        <p className="text-gray-500">המלצה ללא נתונים - מזהה: {offer.recommendationId}</p>
                      </div>
                    );
                  }

                  const rec = offer.recommendation;
                  console.log("שם העסק מהנתונים:", rec.businessName);
                  console.log("כל הנתונים של rec:", rec);
                  const businessName = rec.businessName || "עסק לא ידוע";
                  console.log("שם העסק שנבחר:", businessName);
                  const description = rec.description && rec.description !== "המלצה שמורה" ? rec.description : "";
                  const discount = "10% הנחה"; // כל המלצה שמורה מקבלת 10% הנחה אוטומטי
                  const claimed = offer.claimed || false;
                  
                  return (
                    <Card key={`saved-${offer.id}-${index}`} className="overflow-hidden hover:shadow-lg transition-shadow" dir="rtl">
                      <CardContent className="p-6 text-right">
                        {/* שורה ראשונה - שם העסק */}
                        <div className="mb-3">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{businessName}</h3>
                        </div>
                        
                        {/* שורה שנייה - הנחה */}
                        <div className="mb-4">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 font-medium px-3 py-1">
                            {discount}
                          </Badge>
                        </div>
                        
                        {/* תיאור (אם קיים) */}
                        {description && (
                          <div className="mb-4">
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                              {description}
                            </p>
                          </div>
                        )}
                        
                        {/* שורה תחתונה - תאריך וסטטוס */}
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm text-gray-500">
                              נשמר ב: {offer.savedAt ? new Date(offer.savedAt.seconds * 1000).toLocaleDateString('he-IL') : 'לא ידוע'}
                            </span>
                          </div>
                          <div>
                            <Link href={`/redeem-offer/${offer.id}`}>
                              <Button 
                                size="sm" 
                                variant={claimed ? "destructive" : "default"}
                                className={`${claimed 
                                  ? "bg-green-500 hover:bg-green-600 text-white" 
                                  : "bg-blue-500 hover:bg-blue-600 text-white"
                                } font-medium px-4 py-2`}
                              >
                                {claimed ? "מומש ✓" : "מימוש ההטבה"}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 px-6 bg-white dark:bg-gray-800 rounded-xl shadow-md w-full max-w-lg mx-auto">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">אין הטבות שמורות</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  התחל לשמור הטבות שמעניינות אותך
                </p>
                <Link href="/">
                  <Button>עיין בהמלצות</Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>

        {/* הישגים */}

      </Tabs>
    </div>
  );
}