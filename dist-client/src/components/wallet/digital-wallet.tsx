import { Link } from "wouter";
import { 
  Wallet, 
  Users,
  Bookmark,
  TrendingUp,
  Check
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface WalletCardProps {
  gradient: string;
  icon: React.ReactNode;
  title: string;
  value: number;
  subtext?: React.ReactNode;
}

function WalletCard({ gradient, icon, title, value, subtext }: WalletCardProps) {
  return (
    <div className={`${gradient} rounded-xl p-5 text-white shadow-md`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-base font-medium opacity-90">{title}</h3>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="coin-float">{icon}</div>
      </div>
      {subtext && <div className="mt-4 text-sm opacity-90">{subtext}</div>}
    </div>
  );
}

interface RedeemableOfferProps {
  id: string;
  name: string;
  image: string;
  description: string;
  coins: number;
  onRedeem: (id: string, name: string) => void;
}

function RedeemableOffer({ id, name, image, description, coins, onRedeem }: RedeemableOfferProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center space-x-0 space-x-reverse space-x-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-300">
      <div className="flex-1 text-right">
        <h4 className="font-medium text-gray-800 dark:text-white">{name}</h4>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
        <div className="flex items-center mt-1 justify-between">
          <Button
            size="sm"
            onClick={() => onRedeem(id, name)}
            className="px-2 py-1 bg-primary-500 hover:bg-primary-600 text-white text-xs rounded"
          >
            מימוש
          </Button>
          <div className="flex items-center">
            <span className="text-sm text-gray-700 dark:text-gray-300 ml-1">{coins}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-amber-500 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
      <img
        src={image}
        alt={`${name} Reward`}
        className="w-16 h-16 rounded-lg object-cover"
      />
    </div>
  );
}

export default function DigitalWallet() {
  const { user } = useAuth();
  const { toast } = useToast();

  const redeemableOffers = [
    {
      id: "coffee1",
      name: "קפה ורקשופ",
      image: "https://pixabay.com/get/g50da71414b15d2f75e2f2561e68be2f9955ae90a626f62787a9fd2ed2f2c731dc827ba9d65936b17f2649eb5984e92672ec8932e704e7d5e29f70993cdbf27f8_1280.jpg",
      description: "קפה חינם עם כל קנייה",
      coins: 30,
    },
    {
      id: "fresh1",
      name: "טרי ומקומי",
      image: "https://images.unsplash.com/photo-1447078806655-40579c2520d6?ixlib=rb-1.2.1&auto=format&fit=crop&w=80&h=80",
      description: "10% הנחה בארוחה הבאה",
      coins: 25,
    },
  ];

  const handleRedeem = (id: string, name: string) => {
    const userCoins = user?.coins || 0;
    if (!user || userCoins < 25) {
      toast({
        title: "אין מספיק מטבעות",
        description: "אתה צריך יותר מטבעות כדי לממש הצעה זו.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, we would make an API call to redeem the offer
    toast({
      title: "ההצעה מומשה!",
      description: `מימשת בהצלחה את ההצעה מ-${name}.`,
    });
  };

  if (!user) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-right">הארנק הדיגיטלי שלך</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            עליך להתחבר כדי לצפות בארנק הדיגיטלי שלך.
          </p>
          <Link href="/login">
            <Button>
              התחבר כדי להמשיך
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-right">הארנק הדיגיטלי שלך</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <WalletCard
            gradient="bg-gradient-to-r from-primary-600 to-primary-400"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-yellow-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
            }
            title="סך כל המטבעות"
            value={user.coins || 0}
            subtext={
              <div>
                <div className="w-full h-1 bg-white bg-opacity-30 rounded-full">
                  <div
                    className="h-1 bg-white rounded-full"
                    style={{ width: `${Math.min(100, ((user.coins || 0) / 50) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs opacity-90">
                  <span>0</span>
                  <span>{user.coins || 0}/50 מטבעות עד לדרגת התגמול הבאה</span>
                </div>
              </div>
            }
          />

          <WalletCard
            gradient="bg-gradient-to-r from-green-500 to-green-400"
            icon={<Users className="h-10 w-10 text-white opacity-80" />}
            title="הפניות מוצלחות"
            value={user.referrals || 0}
            subtext={
              <p className="flex items-center">
                <TrendingUp className="h-4 w-4 ml-1" />
                עלייה של {Math.max(0, (user.referrals || 0) - 2)} מהחודש שעבר
              </p>
            }
          />

          <WalletCard
            gradient="bg-gradient-to-r from-amber-500 to-amber-400"
            icon={<Bookmark className="h-10 w-10 text-white opacity-80" />}
            title="הצעות שמורות"
            value={user.savedOffers || 0}
            subtext={
              <p className="flex items-center">
                <Check className="h-4 w-4 ml-1" />
                {Math.max(0, Math.min(2, (user.savedOffers || 0)))} פוקעות תוך 7 ימים
              </p>
            }
          />
        </div>

        {/* Redemption Options */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4 text-right">מוכן למימוש</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {redeemableOffers.map((offer) => (
              <RedeemableOffer
                key={offer.id}
                {...offer}
                onRedeem={handleRedeem}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
