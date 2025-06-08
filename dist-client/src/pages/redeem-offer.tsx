import React from "react";
import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../../../client/src/components/ui/card";
import { Button } from "../../../client/src/components/ui/button";
import { Badge } from "../../../client/src/components/ui/badge";
import { QrCode, CheckCircle, Store, Coins } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getSavedOffers, claimOffer } from "@/lib/firebase";
import QRCode from "qrcode";

export default function RedeemOffer() {
  const [, params] = useRoute("/redeem-offer/:offerId");
  const offerId = params?.offerId;
  const { user } = useAuth();
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    const loadOffer = async () => {
      if (!user || !offerId) return;

      try {
        const savedOffers = await getSavedOffers(user.uid);
        const foundOffer = savedOffers.find((o: any) => o.id === offerId);

        if (foundOffer) {
          setOffer(foundOffer);
          setClaimed(foundOffer.claimed || false);

          // יצירת QR code אמיתי
          const businessName =
            foundOffer.recommendation?.businessName || "עסק לא ידוע";
          const qrData = `SHAREIT:OFFER:${offerId}:${user.uid}:${businessName}`;

          QRCode.toDataURL(qrData, {
            width: 200,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#FFFFFF",
            },
          })
            .then((url) => {
              setQrCodeUrl(url);
            })
            .catch((err) => {
              console.error("Error generating QR code:", err);
            });
        }
      } catch (error) {
        console.error("Error loading offer:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOffer();
  }, [user, offerId]);

  const handleClaim = async () => {
    if (!offerId || !user || !offer) return;

    setClaiming(true);
    try {
      // מוצא את מזהה הממליץ המקורי מההמלצה השמורה
      const referrerId =
        offer.originalReferrerId || offer.recommendation?.userId;

      if (!referrerId) {
        console.error("לא נמצא מפיץ ההמלצה המקורי");
        alert("שגיאה: לא ניתן למצוא את מפיץ ההמלצה המקורי");
        return;
      }

      console.log("מפיץ ההמלצה המקורי:", referrerId);
      console.log("ממש הטבה עבור:", offerId);

      await claimOffer(offerId, referrerId);
      setClaimed(true);

      console.log(
        "הטבה מומשה בהצלחה! נוספו 5 מטבעות למשתף ההמלצה:",
        referrerId,
      );
    } catch (error) {
      console.error("Error claiming offer:", error);
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="max-w-md mx-auto">
          <Card className="animate-pulse">
            <CardContent className="p-8">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <h2 className="text-xl font-bold mb-4">הטבה לא נמצאה</h2>
            <p className="text-gray-600">לא הצלחנו למצוא את ההטבה המבוקשת</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const businessName = offer.recommendation?.businessName || "עסק לא ידוע";
  const discount = "10% הנחה";
  const qrCodeData = `OFFER:${offerId}:${user?.uid}:${businessName}`;

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="max-w-md mx-auto space-y-6">
        {/* כרטיס פרטי ההטבה */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">מימוש הטבה</CardTitle>
            <p className="text-gray-600">הצגי את הקוד הזה לבעל העסק</p>
          </CardHeader>
          <CardContent className="p-6 text-center space-y-4">
            {/* שם העסק */}
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {businessName}
              </h3>
              <Badge className="bg-green-100 text-green-800 mt-2">
                {discount}
              </Badge>
            </div>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <div className="w-48 h-48 mx-auto flex items-center justify-center">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="QR Code להטבה"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="bg-gray-100 rounded-lg w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500">יוצר QR Code...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* קוד הטבה מספרי */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">קוד הטבה:</p>
              <p className="text-2xl font-bold font-mono tracking-wider">
                {offerId ? offerId.slice(-6).toUpperCase() : "------"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* הדמיית מימוש */}
        <Card className="border-dashed border-2 border-blue-300 bg-blue-50">
          <CardContent className="p-6 text-center">
            <Store className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-bold mb-2">דמיית מימוש בעל עסק</h3>
            <p className="text-sm text-gray-600 mb-4">
              בתהליך האמיתי, בעל העסק יסרוק את הקוד או יקליד אותו
            </p>

            {claimed ? (
              <div className="text-center">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <h4 className="text-xl font-bold text-green-700 mb-2">
                  הטבה מומשה!
                </h4>
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Coins className="h-5 w-5" />
                  <span className="font-medium">
                    נוספו 5 מטבעות למפיץ ההמלצה
                  </span>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleClaim}
                disabled={claiming}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {claiming ? "מבצע מימוש..." : "דמה מימוש הטבה"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* הסבר על התהליך */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h4 className="font-bold mb-2">איך זה עובד?</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. הראי את הקוד לבעל העסק</li>
              <li>2. בעל העסק סורק/מקליד את הקוד</li>
              <li>3. ההטבה ממומשת וחלה הנחה</li>
              <li>4.  הממליץ מקבל 5 מטבעות</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
