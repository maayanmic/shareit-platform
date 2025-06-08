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
import { Link } from "wouter";
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
        businessImage: imageUrl,
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
        <Button asChild>
          <Link href="/login">Log In to Continue</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h2 className="text-lg font-semibold">Create New Recommendation</h2>
      </div>
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User"} />
            <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                <FormField
                  control={form.control}
                  name="businessId"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Business</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select business or scan QR code" />
                            </SelectTrigger>
                            <SelectContent>
                              {businesses.map((business) => (
                                <SelectItem key={business.id} value={business.id}>
                                  {business.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className="bg-white dark:bg-gray-800"
                          onClick={handleBusinessScan}
                        >
                          <Camera className="h-5 w-5" />
                          <span className="sr-only">Scan QR Code</span>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Your Recommendation</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Share what you loved about this business..." 
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="mb-4">
                  <FormLabel>Add Photo/Video</FormLabel>
                  <div className="flex items-center justify-center w-full">
                    {imagePreview ? (
                      <div className="relative w-full">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="h-32 w-full object-cover rounded-lg" 
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 w-full text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Click to upload photo or video
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="socialNetwork"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Share on</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="facebook" id="facebook" />
                            <Label htmlFor="facebook">Facebook</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="instagram" id="instagram" />
                            <Label htmlFor="instagram">Instagram</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="tiktok" id="tiktok" />
                            <Label htmlFor="tiktok">TikTok</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? "Posting..." : "Post Recommendation"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
} 