import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { getUserRecommendations } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, 
  Share, 
  Users, 
  ThumbsUp, 
  Award, 
  Settings, 
  Edit,
  Info
} from "lucide-react";
import RecommendationCard from "@/components/recommendation/recommendation-card";
import DigitalWallet from "@/components/wallet/digital-wallet";
import { useQRScanner } from "@/components/qr/qr-scanner-modal";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qrScanner = useQRScanner();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRecommendations = async () => {
      if (!user) return;

      try {
        console.log("Fetching recommendations for user:", user.uid);
        setError(null);
        const data = await getUserRecommendations(user.uid);
        console.log("Received recommendations data:", data);
        
        if (Array.isArray(data)) {
          setRecommendations(data);
        } else {
          console.error("Unexpected data format:", data);
          setRecommendations([]);
          setError("התקבל פורמט נתונים לא צפוי");
        }
      } catch (error) {
        console.error("Error fetching user recommendations:", error);
        setError("שגיאה בטעינת ההמלצות שלך");
        toast({
          title: "שגיאה בטעינת המלצות",
          description: "לא ניתן לטעון את ההמלצות שלך. אנא נסה שוב מאוחר יותר.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserRecommendations();
  }, [user, toast]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Info className="h-16 w-16 text-primary-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">נדרשת התחברות</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              עליך להתחבר כדי לצפות בפרופיל שלך.
            </p>
            <div className="flex justify-center space-x-4">
              <Button asChild>
                <Link href="/login">התחבר</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/register">הרשמה</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-32 flex items-end p-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
            <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800">
              {user.photoURL ? (
                <AvatarImage src={user.photoURL} alt={user.displayName || "User"} />
              ) : null}
            </Avatar>
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h1 className="text-2xl font-bold text-white">{user.displayName}</h1>
              <p className="text-primary-100">
                @{user.displayName?.toLowerCase().replace(/\s+/g, "") || "user"}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
              <span>
                <span className="font-semibold">{user.referrals || 0}</span> הפניות
              </span>
            </div>
            <div className="flex items-center">
              <Share className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
              <span>
                <span className="font-semibold">{recommendations.length}</span> המלצות
              </span>
            </div>
            <div className="flex items-center">
              <ThumbsUp className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
              <span>
                <span className="font-semibold">{user.savedOffers || 0}</span> הצעות שמורות
              </span>
            </div>
            <div className="flex items-center">
              <Award className="h-5 w-5 text-amber-500 mr-2" />
              <span>
                <span className="font-semibold">{user.coins || 0}</span> מטבעות
              </span>
            </div>
          </div>
          <div className="mt-6 flex justify-center md:justify-end gap-4">
            <Button variant="outline" className="flex items-center">
              <Edit className="h-4 w-4 mr-2" />
              עריכת פרופיל
            </Button>
            <Button variant="outline" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              הגדרות
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <Tabs defaultValue="recommendations">
        <TabsList className="mb-6">
          <TabsTrigger value="recommendations">ההמלצות שלי</TabsTrigger>
          <TabsTrigger value="wallet">ארנק דיגיטלי</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommendations">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-semibold mb-2 md:mb-0 text-right w-full">ההמלצות שלך</h2>
            <Button
              onClick={() => qrScanner.openScanner()}
            >
              <Camera className="h-4 w-4 mr-2" />
              סרוק QR וצור המלצה
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 h-96 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                  <div className="w-2/3 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="w-1/3 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="flex justify-between mb-4">
                    <div className="w-1/4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-1/4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-1/2 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-1/4 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
              <div className="flex flex-col items-center">
                <svg
                  className="h-20 w-20 text-red-400 dark:text-red-600 mb-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold mb-2">שגיאה בטעינת המלצות</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                  {error}
                </p>
                <div className="flex space-x-4">
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    נסה שוב
                  </Button>
                  <Button
                    onClick={() => qrScanner.openScanner()}
                  >
                    סרוק QR ליצירת המלצה
                  </Button>
                </div>
              </div>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  id={recommendation.id}
                  businessName={recommendation.businessName}
                  businessImage={recommendation.imageUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5"}
                  description={recommendation.description}
                  discount={recommendation.discount || "10% הנחה"}
                  rating={recommendation.rating || 4}
                  recommenderName={recommendation.userDisplayName || user.displayName || "משתמש"}
                  recommenderPhoto={recommendation.userPhotoURL || user.photoURL || ""}
                  recommenderId={recommendation.userId || user?.uid || ""}
                  validUntil={recommendation.validUntil || "ללא הגבלה"}
                  savedCount={recommendation.savedCount || 0}
                  saved={true}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
              <div className="flex flex-col items-center">
                <svg
                  className="h-20 w-20 text-gray-400 dark:text-gray-600 mb-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
                <h3 className="text-lg font-semibold mb-2">אין לך המלצות עדיין</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6 ">
                  עדיין לא יצרת המלצות. התחל לשתף את העסקים האהובים עליך!
                </p>
                <Button
                  onClick={() => qrScanner.openScanner()}
                >
                  סרוק QR וצור את ההמלצה הראשונה שלך
                </Button>
              </div>
            </div>
          )}
          

        </TabsContent>
        
        <TabsContent value="wallet">
          <DigitalWallet />
        </TabsContent>
      </Tabs>
    </div>
  );
}
