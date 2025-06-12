import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  StarIcon, 
  ClockIcon, 
  UsersIcon, 
  Share2, 
  Heart 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { saveOffer, getSavedOffers } from "@/lib/firebase";

interface RecommendationCardProps {
  recommendation: {
    id: string;
    businessId: string;
    businessName: string;
    description: string;
    discount: number;
    rating: number;
    imageUrl: string;
    expiryDate: string;
    savedCount: number;
    creator: {
      id: string;
      name: string;
      photoUrl: string;
    }
  }
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // נסה לקבל את המשתמש מ-localStorage או context
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    }
  }, []);

  useEffect(() => {
    async function checkIfSaved() {
      if (user && recommendation && recommendation.id) {
        const saved = await getSavedOffers(user.uid);
        const found = saved.some((offer: any) => offer.recommendationId === recommendation.id);
        setIsSaved(found);
      }
    }
    checkIfSaved();
  }, [user, recommendation]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Generate stars for rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarIcon 
          key={i} 
          className={`h-4 w-4 ${i <= rating ? 'text-accent-500' : 'text-gray-300 dark:text-gray-600'}`} 
          fill={i <= rating ? 'currentColor' : 'none'} 
        />
      );
    }
    return stars;
  };

  const handleSaveOffer = async () => {
    if (isSaved || !user) return;
    setIsSaving(true);
    try {
      await saveOffer(user.uid, recommendation.id);
      setIsSaved(true);
      toast({
        title: "נשמר בהצלחה",
        description: `ההמלצה נשמרה באיזור האישי שלך`,
      });
    } catch (error) {
      toast({
        title: "שגיאה בשמירה",
        description: "לא ניתן לשמור את ההמלצה. אנא נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    // Implementation for sharing functionality will be added here
    toast({
      title: "Share Feature",
      description: "Sharing functionality will be implemented with social media APIs.",
    });
  };

  return (
    <Card className="overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-md transition duration-300">
      <div className="relative">
        <img 
          src={recommendation.imageUrl} 
          alt={recommendation.businessName} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
          {recommendation.discount}% OFF
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex flex-row-reverse items-center justify-between mt-2 mb-2">
          <div className="flex-1 text-right">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{recommendation.businessName}</h3>
          </div>
          <div className="flex flex-col items-center ml-4">
            <img 
              src={recommendation.creator.photoUrl} 
              alt={recommendation.creator.name} 
              className="h-10 w-10 rounded-full object-cover mb-1"
            />
          </div>
        </div>
        <div className="flex items-center mt-4">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>Valid until {formatDate(recommendation.expiryDate)}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <UsersIcon className="h-4 w-4 mr-1" />
            <span>{recommendation.savedCount} people saved</span>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          <Button
            onClick={handleSaveOffer}
            className="flex-1 mr-2 flex items-center justify-center gap-2"
            variant={isSaved ? "outline" : "default"}
          >
            {isSaved && <Heart className="h-4 w-4 text-red-500 fill-red-500 stroke-red-500" />}
            שמירה
          </Button>
          <Button 
            onClick={handleShare} 
            variant="outline" 
            className="flex items-center justify-center"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
