import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { AlertCircle, Upload } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const socialPlatforms = [
  { id: 'facebook', name: 'Facebook' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'tiktok', name: 'TikTok' }
];

const businesses = [
  { id: 'coffee', name: 'Coffee Workshop' },
  { id: 'attire', name: 'Urban Attire' },
  { id: 'restaurant', name: 'Fresh & Local' }
];

export function CreateRecommendation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [recommendation, setRecommendation] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("facebook");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBusiness) {
      toast({
        title: "Please select a business",
        variant: "destructive",
      });
      return;
    }

    if (!recommendation.trim()) {
      toast({
        title: "Please enter your recommendation",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would upload the file to Firebase Storage
      // and get a URL back, then send that URL with the recommendation data
      await apiRequest('POST', '/api/recommendations', {
        businessId: selectedBusiness,
        text: recommendation,
        socialPlatform: selectedPlatform,
        mediaUrl: mediaPreview || ''
      });
      
      // Reset form
      setSelectedBusiness("");
      setRecommendation("");
      setMediaPreview(null);
      setFile(null);
      
      // Refetch recommendations
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
      
      toast({
        title: "Recommendation posted!",
        description: "Your recommendation has been shared successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to post your recommendation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader className="border-b">
        <CardTitle>Create New Recommendation</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "User"} />
            <AvatarFallback>
              {(user?.displayName || 'משתמש')
                .split(' ')
                .map((word: string) => word[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
              <div className="mb-4">
                <Label htmlFor="business">Business</Label>
                <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business or scan QR code" />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map(business => (
                      <SelectItem key={business.id} value={business.id}>
                        {business.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-4">
                <Label htmlFor="recommendation-text">Your Recommendation</Label>
                <Textarea 
                  id="recommendation-text" 
                  rows={3} 
                  placeholder="Share what you loved about this business..."
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <Label>Add Photo/Video</Label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300">
                    {mediaPreview ? (
                      <div className="h-full w-full flex items-center justify-center p-1">
                        <img 
                          src={mediaPreview} 
                          alt="Preview" 
                          className="h-full max-h-20 object-contain rounded"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Upload photo or video</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <Label>Share to</Label>
                <RadioGroup 
                  value={selectedPlatform} 
                  onValueChange={setSelectedPlatform}
                  className="flex space-x-3"
                >
                  {socialPlatforms.map(platform => (
                    <div key={platform.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={platform.id} id={platform.id} />
                      <Label htmlFor={platform.id}>{platform.name}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Post Recommendation"}
              </Button>
            </form>
            <div className="mt-2 flex items-center">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <AlertCircle className="h-4 w-4 mr-1" />
                Posting will create a unique link to track when your friends use your recommendation
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
