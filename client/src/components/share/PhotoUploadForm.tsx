import { useState, useRef } from "react";
import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";

interface PhotoUploadFormProps {
  businessId: string;
  businessName: string;
  onComplete: (recommendationText: string, imageUrl: string) => void;
  onBack: () => void;
}

export default function PhotoUploadForm({
  businessId,
  businessName,
  onComplete,
  onBack
}: PhotoUploadFormProps) {
  const [recommendationText, setRecommendationText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // טיפול בבחירת תמונה
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // בדיקה שזה קובץ תמונה תקין
    if (!file.type.match("image.*")) {
      toast({
        title: "קובץ לא תקין",
        description: "אנא בחר קובץ תמונה בלבד (jpg, png, gif)",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    
    // יצירת URL לתצוגה מקדימה של התמונה
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // פתיחת חלון בחירת תמונה
  const handleChooseImageClick = () => {
    fileInputRef.current?.click();
  };

  // שליחת הטופס
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "נדרשת התחברות",
        description: "יש להתחבר למערכת כדי לשתף המלצות",
        variant: "destructive",
      });
      return;
    }

    if (!recommendationText.trim()) {
      toast({
        title: "שדה חובה",
        description: "אנא כתוב את ההמלצה שלך",
        variant: "destructive",
      });
      return;
    }

    if (!selectedImage && !imagePreviewUrl) {
      toast({
        title: "תמונה חסרה",
        description: "אנא בחר תמונה להמלצה",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // השתמש בתצוגה המקדימה של התמונה מיד - זה יותר מהיר
      const imageUrl = imagePreviewUrl || "";
      
      // העבר לשלב הבא מיד
      onComplete(recommendationText, imageUrl);
      
      // העלאת התמונה תתבצע ברקע אם נדרש
      if (selectedImage && user) {
        try {
          const uploadPath = `recommendations/${user.uid}/${Date.now()}_${selectedImage.name}`;
          await uploadImage(selectedImage, uploadPath);
          console.log("תמונה הועלתה בהצלחה ברקע");
        } catch (uploadError) {
          console.error("שגיאה בהעלאת תמונה ברקע:", uploadError);
          // לא מציג שגיאה למשתמש כי הוא כבר עבר לשלב הבא
        }
      }
      
      setIsSubmitting(false);
      
    } catch (error) {
      console.error("שגיאה בתהליך:", error);
      toast({
        title: "שגיאה בתהליך",
        description: "אירעה שגיאה בתהליך. אנא נסה שוב.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="w-full max-w-full md:max-w-xl xl:max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex flex-col items-center md:items-start">
          <h2 className="text-2xl font-bold mb-6 text-center md:text-right">העלאת המלצה</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-center md:text-right">
            {businessName}
          </p>
          <div className="w-full mb-6 md:mb-8">
            <Textarea
              placeholder="כתוב את ההמלצה שלך כאן..."
              value={recommendationText}
              onChange={(e) => setRecommendationText(e.target.value)}
              className="w-full h-32 md:h-40 resize-none"
            />
          </div>
          <div className="w-full mb-8 md:mb-10">
            <div className="flex items-center justify-center w-full">
              {selectedImage ? (
                <div className="relative w-full">
                  <img 
                    src={imagePreviewUrl || ''} 
                    alt="Preview" 
                    className="h-32 md:h-48 w-full object-cover rounded-lg" 
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreviewUrl(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    הסר
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col w-full h-24 md:h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">העלה תמונה או וידאו</p>
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept="image/*,video/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>
          <div className="flex justify-between w-full mt-8 lg:mt-6 max-w-xl mx-auto md:mx-0">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !recommendationText.trim() || !selectedImage}
              className="bg-gray-600 text-white hover:bg-gray-500 px-10 py-6 text-lg md:px-12"
            >
              {isSubmitting ? (
                <>
                  <span className="h-5 w-5 ml-2 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                  שומר...
                </>
              ) : "המשך"}
            </Button>
            
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
              className="bg-gray-50 text-gray-700 hover:bg-gray-100 px-8 py-6 text-lg md:px-10"
            >
              חזור
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}