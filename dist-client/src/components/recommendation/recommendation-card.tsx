import { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  Share2, 
  Star,
  Clock, 
  Users,
  CheckCircle2
} from "lucide-react";
import { saveOffer, getSavedOffers } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RecommendationCardProps {
  id: string;
  businessName: string;
  businessImage: string;
  description: string;
  discount: string;
  rating: number;
  recommenderName: string;
  recommenderPhoto: string;
  recommenderId: string;
  validUntil: string;
  savedCount: number;
  saved?: boolean;
}

export default function RecommendationCard({
  id,
  businessName,
  businessImage,
  description,
  discount,
  rating,
  recommenderName,
  recommenderPhoto,
  recommenderId,
  validUntil,
  savedCount,
  saved = false,
}: RecommendationCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(saved);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localSavedCount, setLocalSavedCount] = useState(savedCount);

  // בדיקה אם המשתמש כבר שמר את ההמלצה
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user) return;
      
      try {
        console.log("בודק אם המלצה נשמרה:", id);
        const savedOffers = await getSavedOffers(user.uid);
        console.log("המלצות שמורות למשתמש:", savedOffers);
        const isAlreadySaved = savedOffers.some(offer => 
          offer.recommendationId === id || 
          offer.recommendation?.id === id
        );
        console.log("האם המלצה", id, "נשמרה?", isAlreadySaved);
        setIsSaved(isAlreadySaved);
      } catch (error) {
        console.error("Error checking if recommendation is saved:", error);
      }
    };

    checkIfSaved();
  }, [user, id]);

  const handleSaveOffer = async () => {
    if (!user) {
      setIsDialogOpen(true);
      return;
    }

    // בדיקה אם המשתמש מנסה לשמור המלצה של עצמו
    if (recommenderId === user.uid) {
      toast({
        title: "לא ניתן לשמור",
        description: "אתה לא יכול לשמור המלצה שיצרת בעצמך",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log("שומר המלצה:", { userId: user.uid, recommendationId: id, businessName });
      await saveOffer(user.uid, id);
      setIsSaved(true);
      setLocalSavedCount(prev => prev + 1);
      toast({
        title: "ההצעה נשמרה",
        description: `שמרת את ההצעה מ${businessName}. רענן את הפרופיל לראות אותה.`,
      });
      console.log("המלצה נשמרה בהצלחה - יש לרענן את הפרופיל");
      
      // אירוע מותאם אישית שיגרום לרענון הפרופיל
      window.dispatchEvent(new CustomEvent('offerSaved'));
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את ההצעה. אנא נסה שוב.",
        variant: "destructive",
      });
    }
  };

  const shareSocial = () => {
    if (navigator.share) {
      navigator.share({
        title: `${discount} off at ${businessName}`,
        text: description,
        url: window.location.href,
      }).catch(error => {
        toast({
          title: "Error",
          description: "Failed to share. Please try again.",
          variant: "destructive",
        });
      });
    } else {
      // Fallback
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`${discount} off at ${businessName}: ${description}`);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition duration-300">
        <div className="relative">
          <img 
            src={businessImage} 
            alt={businessName} 
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            {discount}
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300 dark:text-gray-600'}`} 
                />
              ))}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-right">{businessName}</h3>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 text-right">{description}</p>
          
          <div className="flex items-center justify-end mt-4">
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              הומלץ על-ידי <span className="font-medium text-gray-700 dark:text-gray-300">{recommenderName}</span>
            </span>
            <Avatar className="h-6 w-6">
              <AvatarImage src={recommenderPhoto} alt={recommenderName} />
              <AvatarFallback>{recommenderName && recommenderName.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex flex-row-reverse justify-between items-center mt-4">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <span>בתוקף עד {validUntil}</span>
              <Clock className="h-4 w-4 mr-1" />
            </div>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <span>{localSavedCount} אנשים שמרו</span>
              <Users className="h-4 w-4 mr-1" />
            </div>
          </div>
          
          <div className="mt-4 flex justify-between">
            <Button 
              variant="outline" 
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
              onClick={shareSocial}
            >
              שתף
              <Share2 className="h-4 w-4 mr-2" />
            </Button>
            <Button 
              className={`flex-1 ml-2 ${isSaved ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
              onClick={handleSaveOffer}
              disabled={isSaved}
            >
              {isSaved ? (
                <>
                  נשמר
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                </>
              ) : (
                'שמור הצעה'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>נדרשת התחברות</AlertDialogTitle>
            <AlertDialogDescription>
              עליך להיות מחובר כדי לשמור הצעות. האם ברצונך להתחבר עכשיו?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <Link href="/login">
              <AlertDialogAction>התחברות</AlertDialogAction>
            </Link>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
