import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  StarIcon, 
  ClockIcon, 
  UsersIcon, 
  Share2 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

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
    if (isSaved) return;
    
    setIsSaving(true);
    try {
      await apiRequest('POST', `/api/offers/save/${recommendation.id}`, {});
      queryClient.invalidateQueries({ queryKey: ['/api/offers/saved'] });
      setIsSaved(true);
      toast({
        title: "Offer Saved!",
        description: `You've saved ${recommendation.discount}% off at ${recommendation.businessName}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to save this offer. Please try again.",
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
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{recommendation.businessName}</h3>
          <div className="flex items-center">
            {renderStars(recommendation.rating)}
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{recommendation.description}</p>
        
        <div className="flex items-center mt-4">
          <img 
            src={recommendation.creator.photoUrl} 
            alt={recommendation.creator.name} 
            className="h-6 w-6 rounded-full object-cover"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            Recommended by <span className="font-medium text-gray-700 dark:text-gray-300">{recommendation.creator.name}</span>
          </span>
        </div>
        
        <div className="flex justify-between items-center mt-4">
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
            disabled={isSaved || isSaving}
            className="flex-1 mr-2"
            variant={isSaved ? "outline" : "default"}
          >
            {isSaving ? "Saving..." : isSaved ? "Saved" : "Save Offer"}
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
