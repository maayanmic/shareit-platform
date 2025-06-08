import { useState, useRef } from "react";
import { Camera, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";

interface CreateRecommendationFormProps {
  businessId: string;
  businessName: string;
  onComplete: (recommendationId: string, text: string, imageUrl: string) => void;
  onBack: () => void;
}

export function CreateRecommendationForm({
  businessId,
  businessName,
  onComplete,
  onBack
}: CreateRecommendationFormProps) {
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

  // פונקציה לפתיחת חלון בחירת תמונה
  const handleChooseImageClick = () => {
    fileInputRef.current?.click();
  };

  // שליחת ההמלצה
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

    if (!selectedImage) {
      toast({
        title: "תמונה חסרה",
        description: "אנא בחר תמונה להמלצה",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // העלאת התמונה לשרת
      const imagePath = `recommendations/${user.uid}_${Date.now()}`;
      const imageUrl = await uploadImage(selectedImage, imagePath);

      // ביצוע מעבר למסך הבא עם הנתונים
      // בתרחיש אמיתי, כאן היינו יוצרים את רשומת ההמלצה במסד הנתונים
      
      // קריאה להמשך התהליך עם הנתונים החדשים
      const mockRecommendationId = `rec_${Date.now()}`; // בתרחיש אמיתי זה יבוא מתגובת השרת
      onComplete(mockRecommendationId, recommendationText, imageUrl);
      
    } catch (error) {
      console.error("שגיאה בהעלאת התמונה:", error);
      toast({
        title: "שגיאה בשמירת ההמלצה",
        description: "אירעה שגיאה בשמירת ההמלצה. אנא נסה שוב.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <Camera className="h-12 w-12 text-primary-500 mx-auto mb-2" />
      
      <h2 className="text-xl font-bold mb-2">צילום והמלצה</h2>
      <p className="text-gray-600 mb-6 text-center">צלם תמונה והוסף המלצה על החוויה שלך</p>
      
      {/* חלק בחירת התמונה */}
      <div className="w-full mb-4">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageChange}
        />
        
        {imagePreviewUrl ? (
          <div className="relative mb-4">
            <img 
              src={imagePreviewUrl} 
              alt="תצוגה מקדימה" 
              className="w-full h-48 object-cover rounded-md"
            />
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-2 right-2 bg-white"
              onClick={handleChooseImageClick}
            >
              <ImageIcon className="h-4 w-4 ml-1" />
              החלף תמונה
            </Button>
          </div>
        ) : (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:bg-gray-50"
            onClick={handleChooseImageClick}
          >
            <ImageIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">לחץ להעלאת תמונה</p>
          </div>
        )}
      </div>
      
      {/* טקסט ההמלצה */}
      <div className="w-full mb-6">
        <Textarea
          placeholder={`כתוב את ההמלצה שלך כאן...`}
          className="resize-none h-32"
          value={recommendationText}
          onChange={(e) => setRecommendationText(e.target.value)}
        />
      </div>
      
      {/* כפתורי פעולה */}
      <div className="flex justify-between w-full mt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="bg-gray-800 text-white hover:bg-gray-700"
        >
          חזור
        </Button>
        
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !recommendationText.trim() || !selectedImage}
          className="bg-primary-500 hover:bg-primary-600 text-white"
        >
          {isSubmitting ? "שומר..." : "המשך"}
        </Button>
      </div>
    </div>
  );
}