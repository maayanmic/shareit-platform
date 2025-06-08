import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { getSavedOffers, claimOffer } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Check, Star, ExternalLink, Info } from "lucide-react";

export default function SavedOffers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedOffers, setSavedOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("available");

  useEffect(() => {
    const fetchSavedOffers = async () => {
      if (!user) return;

      try {
        const offers = await getSavedOffers(user.uid);
        setSavedOffers(offers);
      } catch (error) {
        console.error("Error fetching saved offers:", error);
        toast({
          title: "Error",
          description: "Failed to load your saved offers. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSavedOffers();
  }, [user, toast]);

  const handleClaimOffer = async (offerId: string, referrerId: string) => {
    if (!user) return;

    try {
      await claimOffer(offerId, referrerId);
      
      // Update the local state to mark the offer as claimed
      setSavedOffers(prev => 
        prev.map(offer => 
          offer.id === offerId 
            ? { ...offer, claimed: true, claimedAt: new Date().toISOString() } 
            : offer
        )
      );
      
      toast({
        title: "Offer Claimed",
        description: "You've successfully claimed this offer. The recommender received 5 coins!",
      });
    } catch (error) {
      console.error("Error claiming offer:", error);
      toast({
        title: "Error",
        description: "Failed to claim the offer. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter offers based on active tab
  const availableOffers = savedOffers.filter(offer => !offer.claimed);
  const claimedOffers = savedOffers.filter(offer => offer.claimed);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Info className="h-16 w-16 text-primary-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">נדרשת התחברות</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              עליך להתחבר כדי לצפות בהצעות השמורות שלך.
            </p>
            <div className="flex justify-center space-x-4">
              <Button asChild>
                <Link href="/login">התחבר</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/register">הרשם</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">ההצעות השמורות שלך</h1>
      
      <Tabs defaultValue="available" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="available">
              הצעות זמינות ({availableOffers.length})
            </TabsTrigger>
            <TabsTrigger value="claimed">
              היסטוריית מימוש ({claimedOffers.length})
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="available">
          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 animate-pulse">
                  <div className="flex">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="ml-4 flex-1">
                      <div className="w-1/3 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                      <div className="flex justify-between">
                        <div className="w-1/4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="w-1/4 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : availableOffers.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {availableOffers.map((offer) => (
                <Card key={offer.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-1/3 h-40 md:h-auto">
                        <img
                          src={offer.recommendation?.businessImage || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5"}
                          alt={offer.recommendation?.businessName || "Business"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">{offer.recommendation?.businessName}</h3>
                            <div className="flex items-center mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < (offer.recommendation?.rating || 4)
                                      ? "text-amber-500 fill-amber-500"
                                      : "text-gray-300 dark:text-gray-600"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="text-sm font-bold px-2 py-1 bg-amber-500 text-white rounded-full">
                            {offer.recommendation?.discount || "10% OFF"}
                          </div>
                        </div>
                        
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                          {offer.recommendation?.description || "No description available"}
                        </p>
                        
                        <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>בתוקף עד {offer.recommendation?.validUntil || "לא זמין"}</span>
                        </div>
                        
                        <div className="flex items-center mt-3">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={offer.recommendation?.recommenderPhoto || ""}
                              alt={offer.recommendation?.recommenderName || "Recommender"}
                            />
                            <AvatarFallback>
                              {(offer.recommendation?.recommenderName || "").charAt(0) || "R"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            Recommended by{" "}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {offer.recommendation?.recommenderName || "Unknown"}
                            </span>
                          </span>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Button
                            onClick={() => handleClaimOffer(offer.id, offer.recommendation?.recommenderId || "")}
                            className="bg-primary-500 hover:bg-primary-600"
                          >
                            מימוש ההצעה
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
              <div className="flex flex-col items-center">
                <svg
                  className="h-20 w-20 text-gray-400 dark:text-gray-600 mb-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <h3 className="text-lg font-semibold mb-2">אין הצעות שמורות</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                  עדיין לא שמרת שום הצעה. עיין בהמלצות ושמור הצעות כדי לצפות בהן כאן.
                </p>
                <Button asChild>
                  <Link href="/recommendations">עיון בהמלצות</Link>
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="claimed">
          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 animate-pulse">
                  <div className="flex">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="ml-4 flex-1">
                      <div className="w-1/3 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                      <div className="flex justify-between">
                        <div className="w-1/4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="w-1/4 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : claimedOffers.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {claimedOffers.map((offer) => (
                <Card key={offer.id} className="overflow-hidden bg-gray-50 dark:bg-gray-800/50">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-1/3 h-40 md:h-auto relative">
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <div className="bg-green-500 text-white px-3 py-1 rounded-full font-medium text-sm flex items-center">
                            <Check className="h-4 w-4 mr-1" />
                            Claimed
                          </div>
                        </div>
                        <img
                          src={offer.recommendation?.businessImage || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5"}
                          alt={offer.recommendation?.businessName || "Business"}
                          className="w-full h-full object-cover opacity-70"
                        />
                      </div>
                      <div className="p-4 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">{offer.recommendation?.businessName}</h3>
                            <div className="flex items-center mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < (offer.recommendation?.rating || 4)
                                      ? "text-amber-500 fill-amber-500"
                                      : "text-gray-300 dark:text-gray-600"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="text-sm font-bold px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full">
                            {offer.recommendation?.discount || "10% OFF"}
                          </div>
                        </div>
                        
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                          {offer.recommendation?.description || "No description available"}
                        </p>
                        
                        <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Claimed on {new Date(offer.claimedAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center mt-3">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={offer.recommendation?.recommenderPhoto || ""}
                              alt={offer.recommendation?.recommenderName || "Recommender"}
                            />
                            <AvatarFallback>
                              {(offer.recommendation?.recommenderName || "").charAt(0) || "R"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            Recommended by{" "}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {offer.recommendation?.recommenderName || "Unknown"}
                            </span>
                          </span>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Button variant="outline" asChild>
                            <a 
                              href={`https://maps.google.com/?q=${offer.recommendation?.businessName}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Business
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
              <div className="flex flex-col items-center">
                <svg
                  className="h-20 w-20 text-gray-400 dark:text-gray-600 mb-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="text-lg font-semibold mb-2">No Claimed Offers</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                  You haven't claimed any offers yet. Save offers and redeem them at the business to see your history here.
                </p>
                <Button asChild>
                  <Link href="/recommendations">Browse Recommendations</Link>
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 text-right">איך להשתמש בהצעות</h2>
        <Separator className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary-50 dark:bg-gray-700 p-4 rounded-full mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-primary-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" 
                />
              </svg>
            </div>
            <h3 className="font-medium mb-2">1. בבית העסק</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">בקר בבית העסק והצג את ההצעה השמורה שלך לקופאי בעת ביצוע רכישה.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary-50 dark:bg-gray-700 p-4 rounded-full mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-primary-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" 
                />
              </svg>
            </div>
            <h3 className="font-medium mb-2">2. מימוש ההצעה</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">לחץ על "מימוש ההצעה" כדי להציג את ההצעה לקופאי.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="bg-primary-50 dark:bg-gray-700 p-4 rounded-full mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-primary-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <h3 className="font-medium mb-2">3. צבירת תגמולים</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">כשחברים משתמשים בהמלצות שלך, תרוויח מטבעות למימוש הצעות נוספות!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
