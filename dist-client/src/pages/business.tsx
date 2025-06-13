import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Share2, MapPin, Phone, Mail, QrCode } from "lucide-react";
import { getBusinessById } from "@/lib/firebase";
import { useQRScanner } from "@/components/qr/qr-scanner-modal";

export default function BusinessPage() {
  const { businessId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const qrScanner = useQRScanner();
  const [, setLocation] = useLocation();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // נסה לטעון את נתוני העסק מהשרת
  useEffect(() => {
    const loadBusiness = async () => {
      if (!businessId) return;

      try {
        // נסה לקבל את נתוני העסק מפיירבייס
        const businessData = await getBusinessById(businessId);

        if (businessData) {
          setBusiness(businessData);
        }
      } catch (error) {
        console.error("Error loading business data:", error);
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה בטעינת נתוני העסק",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadBusiness();
  }, [businessId, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">העסק לא נמצא</h1>
        <p className="mb-6">
          לא הצלחנו למצוא את העסק המבוקש. ייתכן שהוא אינו קיים או שאין לך גישה
          אליו.
        </p>
        <Button onClick={() => setLocation("/")}>חזרה לדף הבית</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 rtl">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-3/5">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">{business.name}</h1>
            </div>

            <div className="relative h-64 w-full mb-6">
              <img
                src={
                  business.logoUrl ||
                  "https://placehold.co/600x400?text=No+Image"
                }
                alt={business.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">תיאור</h2>
              <p className="text-gray-700 dark:text-gray-300">
                {business.description}
              </p>
              <div className="flex flex-row gap-2 justify-start mt-4">
                <Button variant="outline" size="sm">
                  אהבתי
                </Button>
                <Button
                  variant="outline"
                  className="bg-blue-50 text-blue-600 border-blue-100"
                  size="sm"
                >
                  שיתוף
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">פרטי קשר</h2>
            <div
              className="divide-y divide-gray-200 text-right bg-white rounded-lg overflow-hidden border border-gray-200"
              style={{ direction: "rtl", textAlign: "right" }}
            >
              <div className="flex flex-row-reverse items-center py-2 px-2 justify-end">
                <MapPin className="h-5 w-5 ml-2 text-gray-500 flex-shrink-0" />
                <span className="font-medium mr-2">{business.address}</span>
              </div>
              <div className="flex flex-row-reverse items-center py-2 px-2 justify-end">
                <Phone className="h-5 w-5 ml-2 text-gray-500 flex-shrink-0" />
                <span className="font-medium mr-2">{business.phone}</span>
              </div>
              <div className="flex flex-row-reverse items-center py-2 px-2 justify-end">
                <Mail className="h-5 w-5 ml-2 text-gray-500 flex-shrink-0" />
                <span className="font-medium mr-2">
                  {business.website || business.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-2/5">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">שעות פעילות</h2>
            <div
              className="divide-y divide-gray-200 text-right bg-white rounded-lg overflow-hidden border border-gray-200"
              style={{ direction: "rtl" }}
            >
              <div className="flex justify-between items-center py-2 px-2">
                <span>{business.workingHours?.sunday || "9:00-19:00"}</span>
                <span className="font-medium">ראשון:</span>
              </div>
              <div className="flex justify-between items-center py-2 px-2">
                <span>{business.workingHours?.monday || "9:00-19:00"}</span>
                <span className="font-medium">שני:</span>
              </div>
              <div className="flex justify-between items-center py-2 px-2">
                <span>{business.workingHours?.tuesday || "9:00-19:00"}</span>
                <span className="font-medium">שלישי:</span>
              </div>
              <div className="flex justify-between items-center py-2 px-2">
                <span>{business.workingHours?.wednesday || "9:00-19:00"}</span>
                <span className="font-medium">רביעי:</span>
              </div>
              <div className="flex justify-between items-center py-2 px-2">
                <span>{business.workingHours?.thursday || "9:00-19:00"}</span>
                <span className="font-medium">חמישי:</span>
              </div>
              <div className="flex justify-between items-center py-2 px-2">
                <span>{business.workingHours?.friday || "9:00-14:00"}</span>
                <span className="font-medium">שישי:</span>
              </div>
              <div className="flex justify-between items-center py-2 px-2">
                <span>{business.workingHours?.saturday || "סגור"}</span>
                <span className="font-medium">שבת:</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">הצע המלצה</h2>
            <Button className="w-full" onClick={() => qrScanner.openScanner()}>
              <QrCode className="h-4 w-4 ml-2" />
              סרוק QR ליצירת המלצה
            </Button>
          </div>

          {/* כפתור אדום זמני שיוסר בהמשך */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">שתף המלצה לעסק זה</h2>
            <Button
              className="w-full bg-red-600 hover:bg-red-700"
              onClick={() => setLocation(`/business/${businessId}/scan`)}
            >
              <Share2 className="h-4 w-4 ml-2" />
              שתף המלצה (כפתור זמני)
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              כפתור זה ישמש לבדיקות בלבד ויוסר בגרסה הסופית (בפועל מה שיפתח את
              הדף שנמצא בכפתור זה סריקת הQR שמאממת את הנוכחות הפיזית של המשתמש
              בבית העסק)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
