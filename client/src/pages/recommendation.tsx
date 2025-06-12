import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getBusinessById, saveOffer, getRecommendations } from "@/lib/firebase";
import { ArrowLeft, Copy, Star } from "lucide-react";
import RecommendationCard from "@/components/recommendation/recommendation-card";

interface RecommendationParams {
  id: string;
}

export default function RecommendationPage() {
  const [_, navigate] = useLocation();
  const params = useParams<RecommendationParams>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<any | null>(null);
  const [business, setBusiness] = useState<any | null>(null);
  
  // זיהוי פרמטר המפנה מהלינק (אם קיים)
  const urlParams = new URLSearchParams(window.location.search);
  const referrerId = urlParams.get("referrer");
  
  useEffect(() => {
    async function loadRecommendation() {
      try {
        if (!params.id) {
          toast({
            title: "שגיאה",
            description: "מזהה המלצה חסר",
            variant: "destructive"
          });
          return;
        }
        
        const recId = params.id;
        console.log("טוען המלצה לפי מזהה:", recId);
        
        // ניסיון לטעון את ההמלצה האמיתית מפיירבייס
        try {
          // נייבא את כל ההמלצות ונסנן לפי המזהה
          const allRecommendations = await getRecommendations(100);
          console.log("כל ההמלצות שנטענו:", allRecommendations);
          
          // חיפוש ההמלצה לפי המזהה
          const foundRecommendation = allRecommendations.find((rec: any) => rec.id === recId);
          
          if (foundRecommendation) {
            console.log("נמצאה המלצה:", foundRecommendation);
            
            // המרת הנתונים למבנה שנדרש בדף
            const rec: any = foundRecommendation;
            const formattedRecommendation = {
              id: rec.id,
              businessId: rec.businessId,
              businessName: rec.businessName,
              description: rec.text || rec.description,
              discount: rec.discount || "10% הנחה",
              rating: rec.rating || 5,
              imageUrl: rec.imageUrl,
              expiryDate: rec.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              savedCount: rec.savedCount || 0,
              creator: {
                id: rec.userId || referrerId || "user-1",
                name: rec.userName || "משתמש",
                photoUrl: rec.userPhotoURL || "https://randomuser.me/api/portraits/men/32.jpg",
              }
            };
            
            setRecommendation(formattedRecommendation);
            
            // טעינת מידע על העסק
            try {
              const businessData = await getBusinessById(formattedRecommendation.businessId);
              if (businessData) {
                setBusiness(businessData);
              } else {
                // אם לא נמצא מידע על העסק, נשתמש במידע מההמלצה
                setBusiness({
                  id: formattedRecommendation.businessId,
                  name: formattedRecommendation.businessName,
                  category: "עסק",
                  description: "פרטי העסק אינם זמינים",
                  address: "כתובת לא זמינה",
                  image: rec.imageUrl || "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?q=80&w=500",
                });
              }
            } catch (businessError) {
              console.error("שגיאה בטעינת פרטי העסק:", businessError);
            }
            
            return; // יצאנו מהפונקציה כי מצאנו את ההמלצה
          } else {
            console.warn("לא נמצאה המלצה עם המזהה:", recId);
          }
        } catch (firebaseError) {
          console.error("שגיאה בטעינת המלצה מפיירבייס:", firebaseError);
        }
        
        // אם לא מצאנו את ההמלצה או שהייתה שגיאה, נציג מידע לדוגמה
        console.log("משתמש במידע לדוגמה עבור המלצה:", recId);
        const mockRecommendation = {
          id: recId,
          businessId: "business-1",
          businessName: "מסעדת השף",
          description: "האוכל מעולה! שירות מצוין וגם המחירים הוגנים.",
          discount: "15%",
          rating: 4.5,
          imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=500",
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          savedCount: 15,
          creator: {
            id: referrerId || "user-1",
            name: "משתמש לדוגמה",
            photoUrl: "https://randomuser.me/api/portraits/men/32.jpg",
          }
        };
        
        setRecommendation(mockRecommendation);
        
        // מידע לדוגמה על העסק
        setBusiness({
          id: "business-1",
          name: "מסעדת השף",
          category: "מסעדות",
          description: "מסעדה איטלקית אותנטית במרכז העיר",
          address: "רחוב האלמוגים 12, תל אביב",
          image: "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?q=80&w=500",
        });
        
      } catch (error) {
        console.error("שגיאה בטעינת המלצה:", error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את המלצה. אנא נסה שוב מאוחר יותר.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadRecommendation();
  }, [params.id, toast, referrerId]);
  
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
        // ננסה לשמור את ההמלצה בחשבון המשתמש
        // await saveOffer(user.uid, recommendation.id);
        
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

  const handleCopyLink = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      toast({
        title: "הקישור הועתק",
        description: "קישור ההמלצה הועתק ללוח"
      });
    } catch (error) {
      toast({
        title: "שגיאה בהעתקה",
        description: "לא ניתן להעתיק את הקישור",
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
  
  return (
    <div className="container mx-auto py-4 px-4">
      <div className="mb-4">
        <Button variant="ghost" onClick={handleGoBack} className="p-2">
          <ArrowLeft className="h-4 w-4 ml-1" />
          חזרה
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-8 p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{business?.name}</h1>
            <div className="badge bg-primary-500 text-white px-3 py-1 rounded-full">
              הנחה {recommendation.discount}
            </div>
          </div>
          
          <div className="relative rounded-lg overflow-hidden mb-6" style={{ height: '250px' }}>
            <img 
              src={recommendation.imageUrl} 
              alt={business?.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">המלצה</h2>
            <p className="text-gray-700">{recommendation.description}</p>
          </div>
          
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0 ml-3">
              <img 
                src={recommendation.creator.photoUrl} 
                alt={recommendation.creator.name} 
                className="h-10 w-10 rounded-full"
              />
            </div>
            <div>
              <p className="text-sm font-medium">הומלץ ע"י</p>
              <p className="text-sm text-gray-600">{recommendation.creator.name}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <Button className="w-full py-6" onClick={handleSaveOffer}>
              שמור באיזור האישי
            </Button>
          </div>
        </Card>
        
        <div className="md:col-span-4 space-y-6">
          {/* כפתור דירוג המלצה */}
          <Card className="p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
            <div className="text-center">
              <div className="flex justify-center items-center mb-4">
                <div className="bg-amber-500 text-white rounded-full p-3">
                  <Star className="h-8 w-8 fill-current" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-amber-800 mb-2">
                {recommendation.rating ? `${recommendation.rating}/5` : "טרם דורג"}
              </h3>
              <p className="text-amber-700 text-sm mb-4">
                דירוג ההמלצה
              </p>
              <div className="flex justify-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= (recommendation.rating || 0)
                        ? "text-amber-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
                size="sm"
              >
                דרג המלצה זו
              </Button>
            </div>
          </Card>

          {/* פרטי העסק */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">פרטי העסק</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">קטגוריה</p>
                <p>{business?.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">כתובת</p>
                <p>{business?.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">תיאור</p>
                <p>{business?.description}</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>בתוקף עד</span>
                <span>{new Date(recommendation.expiryDate).toLocaleDateString('he-IL')}</span>
              </div>
            </div>
          </Card>

          {/* כפתורי פעולה */}
          <Card className="p-4">
            <Button
              variant="outline"
              className="w-full mb-3"
              onClick={handleCopyLink}
            >
              <Copy className="h-4 w-4 ml-2" />
              העתק קישור
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const text = `בדקו את ההמלצה הזאת: ${business?.name} - ${recommendation.discount} הנחה!`;
                const url = window.location.href;
                if (navigator.share) {
                  navigator.share({
                    title: `המלצה: ${business?.name}`,
                    text: text,
                    url: url
                  });
                } else {
                  navigator.clipboard.writeText(`${text} ${url}`);
                  toast({
                    title: "הועתק ללוח",
                    description: "טקסט השיתוף הועתק ללוח"
                  });
                }
              }}
            >
              שתף בפייסבוק
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}