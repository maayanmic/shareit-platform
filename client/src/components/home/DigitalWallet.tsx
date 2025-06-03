import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Heart, Clock } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface DigitalWalletProps {
  referrals: number;
  savedOffers: number;
  expiringOffers: number;
}

interface RedeemableOffer {
  id: string;
  businessId: string;
  businessName: string;
  description: string;
  imageUrl: string;
  coinCost: number;
}

export function DigitalWallet({ referrals, savedOffers, expiringOffers }: DigitalWalletProps) {
  const { toast } = useToast();
  const { userCoins } = useAuth();
  
  const redeemableOffers: RedeemableOffer[] = [
    {
      id: '1',
      businessId: 'coffee',
      businessName: 'Coffee Workshop',
      description: 'Free coffee with any purchase',
      imageUrl: 'https://pixabay.com/get/g50da71414b15d2f75e2f2561e68be2f9955ae90a626f62787a9fd2ed2f2c731dc827ba9d65936b17f2649eb5984e92672ec8932e704e7d5e29f70993cdbf27f8_1280.jpg',
      coinCost: 30
    },
    {
      id: '2',
      businessId: 'restaurant',
      businessName: 'Fresh & Local',
      description: '10% off your next meal',
      imageUrl: 'https://images.unsplash.com/photo-1447078806655-40579c2520d6?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80',
      coinCost: 25
    }
  ];
  
  const handleRedeem = (offer: RedeemableOffer) => {
    if (userCoins < offer.coinCost) {
      toast({
        title: "Not enough coins",
        description: `You need ${offer.coinCost} coins to redeem this offer.`,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Offer Redeemed!",
      description: `You've redeemed ${offer.description} at ${offer.businessName}.`,
    });
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Your Digital Wallet</h2>
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Coins Card */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-xl p-5 text-white shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-medium opacity-90">Total Coins</h3>
                  <p className="text-3xl font-bold mt-1">{userCoins}</p>
                </div>
                <div className="animate-[coinFloat_2s_ease-in-out_infinite]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full h-1 bg-white bg-opacity-30 rounded-full">
                  <div className="h-1 bg-white rounded-full" style={{ width: `${Math.min(100, (userCoins / 50) * 100)}%` }}></div>
                </div>
                <div className="flex justify-between mt-1 text-xs opacity-90">
                  <span>0</span>
                  <span>{userCoins}/50 coins until next reward tier</span>
                </div>
              </div>
            </div>
            
            {/* Successful Referrals Card */}
            <div className="bg-gradient-to-r from-secondary-500 to-secondary-400 rounded-xl p-5 text-white shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-medium opacity-90">Successful Referrals</h3>
                  <p className="text-3xl font-bold mt-1">{referrals}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white opacity-80" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <div className="mt-4 text-sm opacity-90">
                <p className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  {referrals > 0 ? `Up ${referrals - 5 > 0 ? referrals - 5 : 1} from last month` : 'Start sharing to earn rewards!'}
                </p>
              </div>
            </div>
            
            {/* Saved Offers Card */}
            <div className="bg-gradient-to-r from-accent-500 to-accent-400 rounded-xl p-5 text-white shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-medium opacity-90">Saved Offers</h3>
                  <p className="text-3xl font-bold mt-1">{savedOffers}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white opacity-80" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                  <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                </svg>
              </div>
              <div className="mt-4 text-sm opacity-90">
                <p className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {expiringOffers > 0 ? 
                    `${expiringOffers} expiring within 7 days` : 
                    'No offers expiring soon'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Redemption Options */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Ready to Redeem</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {redeemableOffers.map(offer => (
                <div 
                  key={offer.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300"
                >
                  <img 
                    src={offer.imageUrl} 
                    alt={`${offer.businessName} Reward`} 
                    className="w-16 h-16 rounded-lg object-cover" 
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 dark:text-white">{offer.businessName}</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{offer.description}</p>
                    <div className="flex items-center mt-1 justify-between">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300 ml-1">{offer.coinCost}</span>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleRedeem(offer)}
                        disabled={userCoins < offer.coinCost}
                        variant={userCoins >= offer.coinCost ? "default" : "secondary"}
                      >
                        Redeem
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
