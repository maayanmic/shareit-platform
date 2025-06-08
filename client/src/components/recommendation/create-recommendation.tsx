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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessId: "",
      description: "",
      socialNetwork: "facebook",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
        // Upload the image to Firebase Storage
        imageUrl = await uploadImage(
          imageFile,
          `recommendations/${user.uid}/${Date.now()}_${imageFile.name}`
        );
      }

      // Find the business details
      const business = businesses.find(b => b.id === data.businessId);
      
      // Create recommendation document
      const recommendationId = await createRecommendation({
        userId: user.uid,
        userDisplayName: user.displayName,
        userPhotoURL: user.photoURL,
        businessId: data.businessId,
        businessName: business?.name || data.businessId,
        description: data.description,
        socialNetwork: data.socialNetwork,
        imageUrl,
        discount: business?.id === "coffee" ? "10% OFF" : 
                 business?.id === "attire" ? "15% OFF" : "20% OFF",
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        savedCount: 0,
        createdAt: new Date(),
      });

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
          <div className="w-full mb-8 md:mb-10">
            <div className="flex items-center justify-center w-full">
              {imagePreview ? (
                <div className="relative w-full">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-32 md:h-48 w-full object-cover rounded-lg" 
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
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