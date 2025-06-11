import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { shareToFacebook } from "@/lib/socialShare";

interface SocialSharePanelProps {
  businessName: string;
  recommendationText: string;
  imageUrl?: string;
  recommendationId: string;
  onBack: () => void;
  onComplete: () => void;
}

export function SocialSharePanel({
  businessName,
  recommendationText,
  imageUrl,
  recommendationId,
  onBack,
  onComplete
}: SocialSharePanelProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  
  // יצירת URL לשיתוף עם מזהה ייחודי של ההמלצה
  const getShareUrl = () => {
    const baseUrl = window.location.origin;
    // יצירת קישור ישיר להמלצה
    return `${baseUrl}/recommendation/${recommendationId}`;
  };
  
  // פונקציה לטיפול בשיתוף בפייסבוק - זה כפתור שעובד באמת
  const handleFacebookShare = async () => {
    setIsSharing(true);
    
    try {
      const shareText = `המלצה על ${businessName}: ${recommendationText}`;
      
      console.log("מנסה לשתף בפייסבוק עם התמונה:", imageUrl);
      
      // קריאה אמיתית לפייסבוק - זה צריך לעבוד באמת
      await shareToFacebook(getShareUrl(), shareText, imageUrl);
      
      toast({
        title: "נשלח בהצלחה",
      });
      
      // קריאה לפונקציה להמשך התהליך
      onComplete();
    } catch (error) {
      console.error("שגיאה בשיתוף:", error);
      toast({
        title: "שגיאה בשיתוף",
        description: "לא הצלחנו לשתף את ההמלצה בפייסבוק. אנא נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };
  
  // הערה: כפתורי אינסטגרם וטיקטוק הם ויזואליים בלבד בגרסה זו
  
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 md:px-8 lg:py-12">
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center mb-8 lg:mb-12">
          <Share2 className="h-12 w-12 text-primary-500 mx-auto mb-4" />
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">שיתוף ברשתות</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            שתף את ההמלצה שלך ברשתות החברתיות כדי לעזור לחברים שלך לגלות את {businessName}
          </p>
        </div>
        
        {/* תצוגה רספונסיבית: במובייל בטור, בדסקטופ שתי עמודות */}
        <div className="w-full flex flex-col items-center mb-8">
          {/* אפשרויות שיתוף בלבד, בלי תצוגה גרפית של המלצה */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4 text-right">שתף עם חברים</h2>
            {/* הצגת הקישור הייחודי להמלצה */}
            <div className="mb-6">
              <p className="text-base font-medium mb-2 text-center">הקישור להמלצה שלך:</p>
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="truncate text-sm text-gray-600 text-left flex-grow" dir="rtl">
                  {getShareUrl()}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-2 hover:bg-gray-200"
                  onClick={() => {
                    navigator.clipboard.writeText(getShareUrl());
                    toast({
                      title: "הקישור הועתק",
                      description: "הקישור הועתק ללוח. כעת תוכל להדביק אותו בכל מקום.",
                    });
                  }}
                >
                  העתק
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2 text-right">
                הקישור ייחודי להמלצה שלך ויוביל ישירות אליה
              </p>
            </div>
            {/* כפתורי השיתוף */}
            <div className="space-y-4">
              <Button 
                className="w-full bg-[#1877F2] hover:bg-[#166FE5] flex items-center justify-center py-6 text-lg font-semibold" 
                onClick={handleFacebookShare}
                disabled={isSharing}
              >
                <svg className="h-6 w-6 ml-3 fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                  <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
                </svg>
                שתף בפייסבוק
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <div className="group relative">
                  <Button 
                    className="w-full bg-gray-400 hover:bg-gray-400 flex items-center justify-center py-4 text-base cursor-not-allowed opacity-70" 
                    disabled={true}
                  >
                    <svg className="h-5 w-5 ml-2 fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                    </svg>
                    אינסטגרם
                  </Button>
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 text-sm rounded-lg p-2 border border-gray-200 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
                    יתווסף בהמשך
                  </div>
                </div>
                <div className="group relative">
                  <Button 
                    className="w-full bg-gray-400 hover:bg-gray-400 flex items-center justify-center py-4 text-base cursor-not-allowed opacity-70" 
                    disabled={true}
                  >
                    <svg className="h-5 w-5 ml-2 fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                      <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
                    </svg>
                    טיקטוק
                  </Button>
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 text-sm rounded-lg p-2 border border-gray-200 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
                    יתווסף בהמשך
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between w-full mt-8 lg:mt-6 max-w-xl mx-auto">
          <Button
            onClick={onComplete}
            disabled={isSharing}
            className="bg-gray-600 text-white hover:bg-gray-500 px-10 py-6 text-lg"
          >
            סיום
          </Button>
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isSharing}
            className="bg-gray-50 text-gray-700 hover:bg-gray-100 px-8 py-6 text-lg"
          >
            חזור
          </Button>
        </div>
      </div>
    </div>
  );
}