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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
      <h2 className="text-xl font-semibold mb-4 text-right">ארנק דיגיטלי</h2>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-medium mb-2 text-right">יתרה</h3>
          <p className="text-3xl font-bold text-right">{user.coins || 0} ₪</p>
        </div>
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-medium mb-2 text-right">משיכה</h3>
          <p className="text-3xl font-bold text-right">{user.withdrawn || 0} ₪</p>
        </div>
      </div>
      <div className="flex gap-4 mb-6">
        <Button onClick={() => setShowDepositModal(true)} className="flex-1">
          הפקדה
        </Button>
        <Button onClick={() => setShowWithdrawModal(true)} className="flex-1">
          משיכה
        </Button>
      </div>
      <h3 className="text-lg font-medium mb-4 text-right">היסטוריית עסקאות</h3>
      {user.transactions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            עדיין לא ביצעת עסקאות.
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            התחל בהפקדה או משיכת כספים.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {user.transactions.map((transaction) => (
            <div key={transaction.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">
                  {new Date(transaction.timestamp).toLocaleDateString()}
                </span>
                <span className={`font-semibold ${transaction.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                  {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount} ₪
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {showDepositModal && (
        <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>הפקדת כספים</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">סכום</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
              <Button onClick={handleDeposit} disabled={loading}>
                {loading ? 'מבצע הפקדה...' : 'הפקד'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {showWithdrawModal && (
        <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>משיכת כספים</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="withdrawAmount">סכום</Label>
                <Input
                  id="withdrawAmount"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                />
              </div>
              <Button onClick={handleWithdraw} disabled={loading}>
                {loading ? 'מבצע משיכה...' : 'משוך'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
