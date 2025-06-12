import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getBusinessById, saveOffer, getRecommendations } from "@/lib/firebase";
import { ArrowLeft, Share2, Bookmark, Star, Copy } from "lucide-react";
import { rateRecommendation } from "@/lib/firebase-update";

// פונקציה להוספת תגיות Open Graph דינמיות
const updateMetaTags = (recommendation: any, business: any) => {
  if (typeof document !== 'undefined') {
    // עדכון כותרת הדף
    document.title = `המלצה על ${business?.name || recommendation?.businessName} - ShareIt`;
    
    // הסרת תגיות קיימות
    const existingTags = document.querySelectorAll('meta[property^="og:"], meta[property^="fb:"], meta[name="description"]');
    existingTags.forEach(tag => tag.remove());
    
    // יצירת תגיות חדשות
    const metaTags = [
      { property: "og:title", content: `המלצה על ${business?.name || recommendation?.businessName}` },
      { property: "og:description", content: recommendation?.description || `המלצה מעולה על ${business?.name}` },
      { property: "og:image", content: recommendation?.imageUrl || business?.businessImage || business?.image },
      { property: "og:url", content: window.location.href },
      { property: "og:type", content: "article" },
      { property: "og:site_name", content: "ShareIt" },
      { property: "fb:app_id", content: import.meta.env.VITE_FACEBOOK_APP_ID || "" },
      { name: "description", content: recommendation?.description || `המלצה מעולה על ${business?.name}` }
    ];
    
    // הוספת התגיות ל-head
    metaTags.forEach(({ property, name, content }) => {
      if (content) {
        const meta = document.createElement('meta');
        if (property) meta.setAttribute('property', property);
        if (name) meta.setAttribute('name', name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    });
  }
};

interface RecommendationParams {
  id: string;
}

// דף ייעודי להצגת המלצה ספציפית לפי המזהה שלה
export default function RecommendationById() {
  const [_, navigate] = useLocation();
  const params = useParams<RecommendationParams>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  interface RecommendationData {
    id: string;
    businessId: string;
    businessName: string;
    description: string;
    discount: string;
    rating: number;
    imageUrl: string;
    expiryDate: string;
    validUntil?: string;
    savedCount: number;
    creator: {
      id: string;
      name: string;
      photoUrl: string;
    }
  }
  
  interface BusinessData {
    id: string;
    name: string;
    category: string;
    description: string;
    address: string;
    image: string;
    businessImage?: string;
  }
  
  const [recommendation, setRecommendation] = useState<RecommendationData | null>(null);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  
  // זיהוי פרמטר המפנה מהלינק (אם קיים)
  const urlParams = new URLSearchParams(window.location.search);
  const referrerId = urlParams.get("referrer");
  
  useEffect(() => {
    // פונקציה לטעינת ההמלצה הספציפית
    async function findRecommendation() {
      const recommendationId = params.id;
      console.log("מחפש המלצה עם מזהה:", recommendationId);
      
      if (!recommendationId) {
        console.error("חסר מזהה המלצה");
        return null;
      }
      
      try {
        // טעינת כל ההמלצות לצורך חיפוש
        const allRecommendations = await getRecommendations(100);
        console.log("כל ההמלצות שנטענו:", allRecommendations);
        
        // חיפוש המלצה ספציפית לפי המזהה
        return allRecommendations.find((rec: any) => {
          // בדיקה גמישה - אם המזהה זהה או אם הוא מכיל את המזהה המבוקש
          const recIdMatches = rec.id === recommendationId;
          const recIdContains = rec.id && rec.id.includes && rec.id.includes(recommendationId);
          
          return recIdMatches || recIdContains;
        });
      } catch (error) {
        console.error("שגיאה בחיפוש המלצה:", error);
        return null;
      }
    }
    
    async function loadRecommendation() {
      try {
        setLoading(true);
        
        if (!params.id) {
          toast({
            title: "שגיאה",
            description: "מזהה המלצה חסר",
            variant: "destructive"
          });
          navigate("/");
          return;
        }
        
        console.log("מחפש המלצה לפי מזהה:", params.id);
        
        // ניסיון למצוא את ההמלצה הספציפית
        const foundRecommendation = await findRecommendation();
        
        if (foundRecommendation) {
          console.log("נמצאה ההמלצה!", foundRecommendation);
          
          // המרה למבנה שהדף מצפה לו
          const anyFoundRecommendation = foundRecommendation as any;
          const processedRec: RecommendationData = {
            id: anyFoundRecommendation.id,
            businessId: anyFoundRecommendation.businessId,
            businessName: anyFoundRecommendation.businessName || "עסק לא ידוע",
            description: anyFoundRecommendation.text || anyFoundRecommendation.description || "אין תיאור",
            discount: anyFoundRecommendation.discount || "10% הנחה",
            rating: anyFoundRecommendation.rating || 5,
            imageUrl: anyFoundRecommendation.imageUrl || "",
            expiryDate: anyFoundRecommendation.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            savedCount: anyFoundRecommendation.savedCount || 0,
            creator: {
              id: anyFoundRecommendation.userId || referrerId || "user-1",
              name: anyFoundRecommendation.userName || "יוצר ההמלצה",
              photoUrl: anyFoundRecommendation.userPhotoURL || "",
            }
          };
          
          setRecommendation(processedRec);
          
          // ניסיון לטעון את פרטי העסק
          try {
            const businessData = await getBusinessById(processedRec.businessId);
            
            if (businessData && typeof businessData === 'object') {
              const typedBusinessData: BusinessData = {
                id: (businessData as any).id || "",
                name: (businessData as any).name || "",
                category: (businessData as any).category || "",
                description: (businessData as any).description || "",
                address: (businessData as any).address || "",
                image: (businessData as any).image || "",
                businessImage: (businessData as any).businessImage || undefined,
              };
              setBusiness(typedBusinessData);
            }
          } catch (businessError) {
            console.error("שגיאה בטעינת פרטי העסק:", businessError);
          }
        } else {
          console.warn("לא נמצאה המלצה מתאימה, מציג מידע לדוגמה");
          // מידע לדוגמה במקרה שלא נמצאה המלצה
          const demoRecommendation = {
            id: params.id,
            businessId: "business-demo",
            businessName: "עסק לדוגמה",
            description: "זו המלצה לדוגמה שנוצרה בגלל שלא מצאנו את ההמלצה המקורית.",
            discount: "15% הנחה",
            rating: 4.5,
            imageUrl: "",
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            savedCount: 0,
            creator: {
              id: referrerId || "user-demo",
              name: "משתמש לדוגמה",
              photoUrl: "",
            }
          };
          
          setRecommendation(demoRecommendation);
          
          setBusiness({
            id: "business-demo",
            name: "עסק לדוגמה",
            category: "עסק כללי",
            description: "זהו עסק לדוגמה שנוצר כי לא נמצא העסק המקורי.",
            address: "רחוב לדוגמה 123, תל אביב",
            image: "",
          });
        }
      } catch (error) {
        console.error("שגיאה בטעינת המלצה:", error);
        toast({
          title: "שגיאה בטעינת המלצה",
          description: "לא ניתן לטעון את המלצה המבוקשת.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadRecommendation();
  }, [params.id, toast, navigate, referrerId]);
  
  const handleSaveOffer = async () => {
    if (!user) {
      toast({
        title: "נדרשת התחברות",
        description: "עליך להתחבר כדי לשמור המלצות",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    try {
      if (recommendation) {
        // בדיקה אם המשתמש מנסה לשמור המלצה של עצמו
        if (recommendation.creator?.id === user.uid) {
          toast({
            title: "לא ניתן לשמור",
            description: "אתה לא יכול לשמור המלצה שיצרת בעצמך",
            variant: "destructive"
          });
          return;
        }
        
        console.log("שומר המלצה:", {
          recommendationId: recommendation.id,
          creatorId: recommendation.creator?.id,
          currentUserId: user.uid,
          isOwnRecommendation: recommendation.creator?.id === user.uid
        });
        
        // ניסיון לשמור את ההמלצה
        await saveOffer(user.uid, recommendation.id);
        
        toast({
          title: "נשמר בהצלחה",
          description: `ההמלצה נשמרה באיזור האישי שלך`,
        });
      }
    } catch (error) {
      console.error("שגיאה בשמירת המלצה:", error);
      toast({
        title: "שגיאה בשמירה",
        description: "לא ניתן לשמור את ההמלצה. אנא נסה שוב מאוחר יותר.",
        variant: "destructive"
      });
    }
  };
  
  const handleGoBack = () => {
    navigate("/");
  };

  const handleRating = async (rating: number) => {
    if (!user) {
      toast({
        title: "נדרשת התחברות",
        description: "עליך להיות מחובר כדי לדרג המלצות",
        variant: "destructive"
      });
      return;
    }

    if (!recommendation) {
      return;
    }

    if (recommendation.creator?.id === user.uid) {
      toast({
        title: "לא ניתן לדרג",
        description: "אתה לא יכול לדרג המלצה שיצרת בעצמך",
        variant: "destructive"
      });
      return;
    }

    try {
      await rateRecommendation(recommendation.id, rating, user.uid);
      
      // עדכון הדירוג במקום
      setRecommendation(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          rating: rating
        };
      });
      
      toast({
        title: "דירוג נשמר",
        description: `דירגת את ההמלצה ב-${rating} כוכבים`
      });
      
    } catch (error) {
      console.error("Error rating recommendation:", error);
      toast({
        title: "שגיאה בדירוג",
        description: "לא ניתן לשמור את הדירוג. אנא נסה שוב מאוחר יותר.",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!recommendation) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">לא נמצאה המלצה</h2>
          <p className="text-gray-600 mb-6">ההמלצה שחיפשת אינה קיימת או שהוסרה.</p>
          <Button onClick={handleGoBack}>חזרה לדף הבית</Button>
        </div>
      </div>
    );
  }
  
  // קישור המלצה
  const shareUrl = `${window.location.origin}/recommendation/${recommendation.id}`;

  // הגנות לכל שדה
  const businessName = business?.name || recommendation.businessName || "עסק לא ידוע";
  const businessImage = business?.image || recommendation.imageUrl || "";
  const businessCategory = business?.category || "";
  const description = recommendation.description || "אין תיאור";
  const discount = recommendation.discount || "10% הנחה";
  const savedCount = typeof recommendation.savedCount === "number" ? recommendation.savedCount : 0;
  const expiryDate = recommendation.expiryDate ? new Date(recommendation.expiryDate).toLocaleDateString('he-IL') : "";
  const creatorName = recommendation.creator?.name || "ממליץ אנונימי";
  const creatorPhoto = recommendation.creator?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName)}`;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
        {/* כפתור דירוג המלצה - צד שמאל */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <Card className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 sticky top-4">
            <div className="text-center">
              <div className="flex justify-center items-center mb-4">
                <div className="bg-amber-500 text-white rounded-full p-4">
                  <Star className="h-8 w-8 fill-current" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-amber-800 mb-2">
                {recommendation.rating ? `${recommendation.rating}/5` : "טרם דורג"}
              </h3>
              <p className="text-amber-700 text-sm mb-4">
                דירוג ההמלצה
              </p>
              <div className="flex justify-center space-x-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className="border-none bg-transparent p-0 m-0 outline-none focus:outline-none cursor-pointer hover:scale-110 transition-transform"
                    disabled={!user || !recommendation || recommendation.creator?.id === user.uid}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= (recommendation.rating || 0)
                          ? "text-amber-400 fill-current"
                          : "text-gray-300 hover:text-amber-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {user && recommendation.creator?.id !== user.uid ? (
                <p className="text-sm text-amber-600 text-center">
                  לחץ על כוכב כדי לדרג את ההמלצה
                </p>
              ) : user && recommendation.creator?.id === user.uid ? (
                <p className="text-sm text-gray-500 text-center">
                  זוהי ההמלצה שלך
                </p>
              ) : (
                <Button
                  variant="outline"
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-100"
                  size="lg"
                  onClick={() => {
                    toast({
                      title: "נדרשת התחברות",
                      description: "עליך להיות מחובר כדי לדרג המלצות",
                      variant: "destructive"
                    });
                  }}
                >
                  התחבר כדי לדרג
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* תוכן המלצה מרכזי */}
        <div className="lg:col-span-9 order-1 lg:order-2">
          <Card className="p-0 overflow-hidden shadow-lg">
            <div className="relative h-64 w-full">
              <img
                src={businessImage}
                alt={businessName}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                {discount}
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">{businessName}</h1>
              </div>
              <div className="mb-4 text-gray-600 text-lg">{businessCategory}</div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">המלצה</h2>
                <p className="text-gray-800 text-lg leading-relaxed">{description}</p>
              </div>
              
              <Separator className="my-6" />
              
              <div className="flex items-center mb-6">
                <img
                  src={creatorPhoto}
                  alt={creatorName}
                  className="h-12 w-12 rounded-full ml-4"
                />
                <div>
                  <p className="text-sm font-medium text-gray-500">הומלץ ע"י</p>
                  <p className="text-lg font-semibold">{creatorName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Button
                  className="w-full flex items-center justify-center h-12"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    toast({ title: "הקישור הועתק", description: "הקישור הועתק ללוח. כעת תוכל להדביק אותו בכל מקום." });
                  }}
                  variant="outline"
                >
                  <Copy className="h-5 w-5 ml-2" />
                  העתק קישור
                </Button>
                <Button
                  className="w-full flex items-center justify-center bg-[#1877F2] hover:bg-[#166FE5] text-white h-12"
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
                >
                  שתף בפייסבוק
                </Button>
              </div>
              
              <div className="flex justify-center mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-sm">בתוקף עד</span>
                  <span className="text-sm font-semibold">{expiryDate}</span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <Button className="w-full h-12 text-lg" onClick={handleSaveOffer}>
                  שמור באיזור האישי
                </Button>
                <Button className="w-full h-12" variant="outline" onClick={handleGoBack}>
                  <ArrowLeft className="h-4 w-4 ml-1" />
                  חזרה לדף הבית
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}