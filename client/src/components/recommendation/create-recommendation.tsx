import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Upload, Info } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQRScanner } from "@/components/qr/qr-scanner-modal";
import { useToast } from "@/hooks/use-toast";
import { createRecommendation, uploadImage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";

const formSchema = z.object({
  businessId: z.string().min(1, "Please select a business"),
  description: z.string().min(10, "Description must be at least 10 characters").max(200, "Description must be less than 200 characters"),
  socialNetwork: z.enum(["facebook", "instagram", "tiktok"]),
});

type FormValues = z.infer<typeof formSchema>;

const businesses = [
  { id: "coffee", name: "Coffee Workshop" },
  { id: "attire", name: "Urban Attire" },
  { id: "restaurant", name: "Fresh & Local" },
];

export default function CreateRecommendation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { openScanner } = useQRScanner();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessId: "",
      description: "",
      socialNetwork: "facebook",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setImageFile(selectedFile);
      
      // Create a preview URL for display purposes only
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleBusinessScan = () => {
    openScanner((scannedBusinessId) => {
      if (scannedBusinessId) {
        form.setValue("businessId", scannedBusinessId);
      }
    });
  };

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a recommendation",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;
      
      if (imageFile) {
        // Check file size
        if (imageFile.size > 5 * 1024 * 1024) {
          toast({
            title: "Error",
            description: "File size must be less than 5MB",
            variant: "destructive",
          });
          return;
        }

        // Upload the image to Firebase Storage and get the download URL
        const imagePath = `recommendations/${user.uid}/${Date.now()}_${imageFile.name}`;
        imageUrl = await uploadImage(imageFile, imagePath);
        
        // Make sure we have a valid URL
        if (!imageUrl) {
          throw new Error("Failed to get image URL from Firebase Storage");
        }

        // Log the URL for debugging
        console.log("Firebase Storage URL:", imageUrl);
      }

      // Find the business details
      const business = businesses.find(b => b.id === data.businessId);
      
      // Create recommendation document with the Firebase Storage URL
      const recommendationData = {
        userId: user.uid,
        userDisplayName: user.displayName,
        userPhotoURL: user.photoURL,
        businessId: data.businessId,
        businessName: business?.name || data.businessId,
        description: data.description,
        socialNetwork: data.socialNetwork,
        imageUrl, // This should now be the Firebase Storage URL
        discount: business?.id === "coffee" ? "10% OFF" : 
                 business?.id === "attire" ? "15% OFF" : "20% OFF",
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        savedCount: 0,
        createdAt: new Date(),
      };

      // Log the recommendation data for debugging
      console.log("Creating recommendation with data:", recommendationData);

      const recommendationId = await createRecommendation(recommendationData);

      toast({
        title: "Success!",
        description: "Your recommendation has been posted",
      });

      // Reset form
      form.reset();
      setImagePreview(null);
      setImageFile(null);
    } catch (error) {
      console.error("Error creating recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to create recommendation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md p-6 text-center">
        <h2 className="text-lg font-semibold mb-4">Create New Recommendation</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          You need to be logged in to create recommendations.
        </p>
        <Link href="/login">
          <Button>Log In to Continue</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="w-full max-w-full md:max-w-xl xl:max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex flex-col items-center md:items-start">
          <h2 className="text-2xl font-bold mb-6 text-center md:text-right">העלאת המלצה</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-center md:text-right">
            {businesses.find(b => b.id === form.getValues("businessId"))?.name || "Business"}
          </p>
          <div className="w-full mb-6 md:mb-8">
            <Textarea
              placeholder="כתוב את ההמלצה שלך כאן..."
              value={form.getValues("description")}
              onChange={(e) => form.setValue("description", e.target.value)}
              className="w-full h-32 md:h-40 resize-none"
            />
          </div>

          {/* Image Upload Section */}
          <div className="w-full mb-6">
            <div className="flex flex-col items-center gap-4">
              {imagePreview ? (
                <div className="relative w-full max-w-md">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">לחץ להעלאת תמונה</span> או גרור ושחרר
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG או JPEG (מקסימום 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>
          <div className="flex justify-between w-full mt-8 lg:mt-6 max-w-xl mx-auto md:mx-0">
            <Button
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting}
              className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-8 py-6 text-lg md:px-10"
            >
              חזור
            </Button>
            
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting || !form.getValues("description").trim() || !imagePreview}
              className="bg-gray-800 text-white hover:bg-gray-700 px-10 py-6 text-lg md:px-12"
            >
              {isSubmitting ? (
                <>
                  <span className="h-5 w-5 ml-2 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                  שומר...
                </>
              ) : "המשך"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}