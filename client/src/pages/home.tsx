import { useState, useEffect } from "react";
import RecommendationCard from "@/components/recommendation/recommendation-card";
import { getRecommendations, getBusinessById, getBusinesses, getLogoURL, saveOffer, getSavedOffers } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { UserPlus, HelpCircle, QrCode, Users, TrendingUp, Heart, MessageCircle, Share2, Star } from "lucide-react";

import { rateRecommendation } from "@/lib/firebase-update";

export default function Home() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasConnections, setHasConnections] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});

  const { toast } = useToast();
  const { user } = useAuth();

  const handleRating = async (recommendationId: string, newRating: number, recommenderId: string) => {
    if (!user) {
      toast({
        title: "נדרשת התחברות",
        description: "עליך להיות מחובר כדי לדרג המלצות",
        variant: "destructive"
      });
      return;
    }

    if (recommenderId === user.uid) {
      toast({
        title: "לא ניתן לדרג",
        description: "אתה לא יכול לדרג המלצה שיצרת בעצמך",
        variant: "destructive"
      });
      return;
    }

    try {
      await rateRecommendation(recommendationId, newRating, user.uid);
      
      // עדכון הדירוג במקום ברשימת ההמלצות
      setRecommendations(prev => prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, rating: newRating } 
          : rec
      ));
      
      toast({
        title: "דירוג נשמר",
        description: `דירגת את ההמלצה ב-${newRating} כוכבים`,
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את הדירוג. אנא נסה שוב.",
        variant: "destructive",
      });
    }
  };

  const handleSaveRecommendation = async (recommendationId: string, recommenderId: string) => {
    if (!user) {
      toast({
        title: "נדרשת התחברות",
        description: "עליך להיות מחובר כדי לשמור המלצות",
        variant: "destructive"
      });
      return;
    }

    if (recommenderId === user.uid) {
      toast({
        title: "לא ניתן לשמור",
        description: "אתה לא יכול לשמור המלצה שיצרת בעצמך",
        variant: "destructive"
      });
      return;
    }

    if (savedMap[recommendationId]) return;
    try {
      await saveOffer(user.uid, recommendationId);
      setSavedMap((prev) => ({ ...prev, [recommendationId]: true }));
      toast({
        title: "נשמר בהצלחה",
        description: "ההמלצה נשמרה בארנק הדיגיטלי שלך"
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את ההמלצה. אנא נסה שוב.",
        variant: "destructive",
      });
    }
  };

  // טעינת הלוגו
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const url = await getLogoURL();
        setLogoUrl(url);
      } catch (error) {
        console.error("שגיאה בטעינת הלוגו:", error);
      }
    };
    
    fetchLogo();
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // בדוק אם יש למשתמש חיבורים
        const userConnections = user.connections || [];
        setHasConnections(userConnections.length > 0);
        
        // טען את ההמלצות מהמערכת
        const data = await getRecommendations(10);
        
        // סנן רק המלצות של משתמשים אחרים (לא של המשתמש הנוכחי)
        const filteredRecommendations = data.filter((rec: any) => 
          (rec.recommenderId && rec.recommenderId !== user.uid) || 
          (rec.userId && rec.userId !== user.uid)
        );
        
        console.log(`Filtered recommendations: ${filteredRecommendations.length} out of ${data.length} total`);
        setRecommendations(filteredRecommendations);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  // Check if recommendations are saved immediately when the page loads
  useEffect(() => {
    const checkSaved = async () => {
      if (!user || recommendations.length === 0) return;
      const savedOffers = await getSavedOffers(user.uid);
      const savedIds = new Set(savedOffers.map((offer: any) => offer.recommendationId || offer.recommendation?.id));
      const newMap: Record<string, boolean> = {};
      recommendations.forEach((rec) => {
        newMap[rec.id] = savedIds.has(rec.id);
      });
      setSavedMap(newMap);
    };
    checkSaved();
  }, [user, recommendations]);

  // Sample data for when no actual data is available yet
  const sampleRecommendations = [
    {
      id: "rec1",
      businessName: "Coffee Workshop",
      businessImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400",
      description: "Best specialty coffee in town, friendly staff and amazing pastries! Must try their cold brew.",
      discount: "10% OFF",
      rating: 4,
      recommenderName: "Alex Miller",
      recommenderPhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40",
      recommenderId: "user1",
      validUntil: "Jun 30",
      savedCount: 23,
    },
    {
      id: "rec2",
      businessName: "Urban Attire",
      businessImage: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400",
      description: "Amazing selection of sustainable fashion. The staff helped me find the perfect outfit for my interview!",
      discount: "15% OFF",
      rating: 5,
      recommenderName: "Jessica Lee",
      recommenderPhoto: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40",
      recommenderId: "user2",
      validUntil: "Jul 15",
      savedCount: 42,
    },
    {
      id: "rec3",
      businessName: "Fresh & Local",
      businessImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400",
      description: "Farm-to-table restaurant with seasonal menu. Their honey glazed salmon is a must-try. Great for date nights!",
      discount: "20% OFF",
      rating: 5,
      recommenderName: "Michael Chen",
      recommenderPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40",
      recommenderId: "user3",
      validUntil: "Aug 1",
      savedCount: 17,
    },
  ];

  const displayRecommendations = recommendations.length > 0 ? recommendations : sampleRecommendations;

  return (
    <div className="container mx-auto max-w-6xl px-4">
      <div className="w-full justify-center">

</div>

      {/* כותרת ראשית */}
      
      {/* אזור הלוגו */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-8 md:p-12 mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* צד ימין - לוגו */}
          <div className="md:w-1/2 flex justify-center mb-8 md:mb-0">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="ShareIt Logo" 
                className="h-32 md:h-40 w-auto"
              />
            ) : (
              <div className="h-32 md:h-40 aspect-square bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse">
                {/* לוגו בטעינה */}
              </div>
            )}
          </div>
          
          {/* צד שמאל - טקסט וכפתור */}
          <div className="md:w-1/2 text-center md:text-right space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white">שתף המלצות, צבור מטבעות</h2>
            <p className="text-gray-600 dark:text-gray-300">
              המלץ על עסקים שאתה אוהב, שתף אותם לאחרים וצבור מטבעות על כל המלצה מוצלחת
            </p>
            
            <div className="space-y-3">
              <Link href="/how-it-works">
                <Button 
                  size="lg" 
                  className="w-full md:w-auto text-base px-6 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white dark:bg-sky-700 dark:hover:bg-sky-800 shadow-md"
                >
                  <HelpCircle className="ml-2 h-5 w-5" />
                  איך זה עובד?
                </Button>
              </Link>
              
              {!user && (
                <Link href="/login">
                  <Button 
                    variant="outline"
                    size="lg"
                    className="w-full md:w-auto text-base px-6 py-2 rounded-md shadow-sm mt-3"
                  >
                    התחברות / הרשמה
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* עיטורים גרפיים */}
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 opacity-50"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-indigo-100 dark:bg-indigo-900 opacity-30"></div>
      </div>
      
      {/* אזור יתרונות */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 mb-16">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">המלצות אמיתיות</h3>
          <p className="text-gray-600 dark:text-gray-400">רק אנשים שביקרו בעסק יכולים להמליץ עליו, מה שמבטיח המלצות אמיתיות ואמינות</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">תגמולים אטרקטיביים</h3>
          <p className="text-gray-600 dark:text-gray-400">צבור נקודות על כל המלצה מוצלחת ופדה אותן להטבות ייחודיות בעסקים המשתתפים בפלטפורמה </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">קהילת ממליצים</h3>
          <p className="text-gray-600 dark:text-gray-400">הצטרף לקהילת הממליצים שלנו, עקוב אחרי המלצות של חברים וצור קשרים חדשים</p>
        </div>
      </div>

      {/* פיד המלצות אחרונות */}
      {user && (
        <div className="mt-16 mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">המלצות אחרונות</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : displayRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayRecommendations.slice(0, 6).map((recommendation) => (
                <Card key={recommendation.id} className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  <div className="relative">
                    <img 
                      src={recommendation.businessImage || recommendation.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=250"}
                      alt={recommendation.businessName}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                      {recommendation.discount}
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <img 
                        src={recommendation.recommenderPhoto || recommendation.userPhotoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40"}
                        alt={recommendation.recommenderName || recommendation.userName}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {recommendation.recommenderName || recommendation.userName}
                        </p>
    
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {recommendation.businessName}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                      {recommendation.description || recommendation.text}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1" style={{ zIndex: 10 }}>
                            {[1, 2, 3, 4, 5].map((starNumber) => (
                              <button
                                key={starNumber}
                                type="button"
                                className="border-none bg-transparent p-0 m-0 outline-none focus:outline-none cursor-pointer hover:scale-110 transition-transform"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log(`=== HOME PAGE STAR CLICK ===`);
                                  console.log(`Star ${starNumber} clicked on recommendation ${recommendation.id}`);
                                  
                                  handleRating(
                                    recommendation.id, 
                                    starNumber, 
                                    recommendation.recommenderId || recommendation.userId
                                  );
                                }}
                                style={{ lineHeight: 0 }}
                              >
                                <Star
                                  className={`h-3 w-3 ${starNumber <= (recommendation.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                  style={{ pointerEvents: 'none' }}
                                />
                              </button>
                            ))}
                            <span className="text-xs text-gray-500 ml-2">{recommendation.rating || 5}/5</span>
                          </div>

                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Link href={`/recommendation/${recommendation.id}`}>
                          <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 w-full">
                            צפה בהמלצה
                          </Button>
                        </Link>
                        {user && (recommendation.recommenderId || recommendation.userId) !== user.uid && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full flex items-center justify-center gap-1"
                            onClick={() => handleSaveRecommendation(
                              recommendation.id, 
                              recommendation.recommenderId || recommendation.userId
                            )}
                            disabled={!!savedMap[recommendation.id]}
                          >
                            <Heart className={`h-3 w-3 ${savedMap[recommendation.id] ? 'text-red-500' : ''}`} />
                            שמור
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {recommendation.validUntil && (
                      <p className="text-xs text-gray-500 mt-2">
                        בתוקף עד: {recommendation.validUntil}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  אין עדיין המלצות מחברים
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  התחבר עם חברים כדי לראות את ההמלצות שלהם
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/discover">
                    <Button className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      מצא חברים
                    </Button>
                  </Link>
                  <Link href="/how-it-works">
                    <Button variant="outline" className="flex items-center gap-2">
                      <QrCode className="h-4 w-4" />
                      צור המלצה חדשה
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}