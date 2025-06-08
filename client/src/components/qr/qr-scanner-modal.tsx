import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { X, Upload, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Html5Qrcode } from "html5-qrcode";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

// ממשק להעברת פונקציית קולבק לסריקה
type ScanCallback = (result: string | null) => void;

// טיפוס הקונטקסט של סורק ה-QR
type QRScannerContextType = {
  isOpen: boolean;
  openScanner: (onScan?: ScanCallback) => void;
  closeScanner: () => void;
};

// יצירת קונטקסט לסורק ה-QR
const QRScannerContext = createContext<QRScannerContextType>({
  isOpen: false,
  openScanner: () => {},
  closeScanner: () => {},
});

// הוק שמאפשר גישה לפונקציות הסורק
export const useQRScanner = () => useContext(QRScannerContext);

// רכיב ספק הקונטקסט לסורק ה-QR
export const QRScannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // מצב פתיחת הסורק
  const [isOpen, setIsOpen] = useState(false);
  // פונקציית הקולבק שתיקרא כאשר הסריקה מצליחה
  const [onScanCallback, setOnScanCallback] = useState<ScanCallback>(() => () => {});
  // הוקים שימושיים
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  // סורק ה-QR
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader";
  
  // ניקוי סורק ה-QR כשהקומפוננטה נהרסת
  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // פתיחת חלון הסריקה
  const openScanner = useCallback((onScan?: ScanCallback) => {
    setIsOpen(true);
    if (onScan) {
      setOnScanCallback(() => onScan);
    } else {
      // קולבק ברירת מחדל כשלא מועבר קולבק ספציפי
      setOnScanCallback(() => (result: string | null) => {
        // הניווט מטופל בתוך פונקציית handleSuccessfulScan
        console.log("ברירת מחדל: ניווט לדף העסק");
      });
    }
  }, []);

  // סגירת חלון הסריקה
  const closeScanner = useCallback(() => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop().catch(console.error);
    }
    setIsOpen(false);
  }, []);
  
  // פונקציה לטיפול בסריקה מוצלחת
  const handleSuccessfulScan = useCallback((decodedText: string) => {
    // עצירה בטוחה של הסורק
    if (qrScannerRef.current) {
      try {
        qrScannerRef.current.stop();
      } catch (error) {
        // התעלם משגיאות עצירה כפולה
        console.log("Scanner already stopped or stopping");
      }
    }
    
    // סגירת המודל
    setIsOpen(false);
    
    console.log("קוד QR נסרק בהצלחה:", decodedText);
    
    try {
      // נסה לפרש את טקסט ה-QR כ-URL או מזהה של עסק
      let businessId = "";
      
      // בדוק אם התוצאה היא URL מלא
      if (decodedText.startsWith("http")) {
        // חלץ את מזהה העסק מה-URL
        const url = new URL(decodedText);
        const paramBusinessId = url.searchParams.get("businessId");
        const pathSegments = url.pathname.split("/");
        const lastSegment = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : "";
        
        businessId = paramBusinessId || lastSegment || decodedText;
      } else {
        // אם זה לא URL, הנח שזה מזהה העסק עצמו
        businessId = decodedText;
      }
      
      toast({
        title: "קוד QR נסרק בהצלחה",
        description: "מעבר לדף העסק...",
      });
      
      // בדוק אם המשתמש מחובר
      if (!user) {
        // שמור את מזהה העסק בלוקל סטורג' כדי להעביר את המשתמש לאחר התחברות
        if (businessId) {
          localStorage.setItem("scannedBusinessId", businessId);
          toast({
            title: "נדרשת התחברות",
            description: "יש להתחבר תחילה לפני שניתן להמשיך",
          });
          setLocation("/login");
        } else {
          toast({
            title: "שגיאה",
            description: "מזהה עסק לא חוקי",
            variant: "destructive"
          });
        }
      } else if (businessId) {
        // קרא לפונקציית הקולבק והעבר את המשתמש לדף העסק
        onScanCallback(businessId);
        // ניווט לדף העסק
        setLocation(`/business/${businessId}`);
      } else {
        // אם אין מזהה עסק תקין, הצג שגיאה
        toast({
          title: "שגיאה",
          description: "מזהה עסק לא חוקי",
          variant: "destructive"
        });
      }
      
      closeScanner();
    } catch (error) {
      console.error("שגיאה בעיבוד קוד QR:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעבד את קוד ה-QR. נא לנסות שוב.",
        variant: "destructive"
      });
    }
  }, [closeScanner, onScanCallback, setLocation, toast, user]);
  
  // פונקציה להפעלת סורק ה-QR כשהדיאלוג נפתח
  useEffect(() => {
    if (isOpen) {
      // ודא שהאלמנט קיים לפני שמנסים להתחיל את הסריקה
      setTimeout(() => {
        const scannerContainer = document.getElementById(scannerContainerId);
        if (!scannerContainer) return;
        
        // יצירת מופע חדש של סורק QR
        qrScannerRef.current = new Html5Qrcode(scannerContainerId);
        
        // התחלת סריקה עם מצלמה אחורית - הגדלת אזור הסריקה משמעותית
        qrScannerRef.current.start(
          { facingMode: "environment" },
          {
            fps: 10,
            // הגדרת אזור סריקה גדול יותר שיתפרס על רוב השטח
            qrbox: { width: 280, height: 280 }
          },
          (decodedText) => {
            // עיבוד ההתראה המוצלחת
            handleSuccessfulScan(decodedText);
          },
          (errorMessage) => {
            // שגיאות סריקה לא מוצגות למשתמש כי הן קורות כל הזמן בזמן סריקה
            console.log(errorMessage);
          }
        ).catch((err) => {
          console.error("Error starting QR scanner:", err);
          toast({
            title: "שגיאה בהפעלת המצלמה",
            description: "לא ניתן להפעיל את מצלמת המכשיר, נא לאשר גישה למצלמה.",
            variant: "destructive"
          });
        });
      }, 500);
    }
  }, [isOpen, toast, handleSuccessfulScan]);
  
  // פונקציה לטיפול בהעלאת קובץ עם קוד QR
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    toast({
      title: "מעבד תמונה",
      description: "נא להמתין בזמן שהתמונה נסרקת...",
    });
    
    // עצירת סורק המצלמה החי אם הוא פעיל
    if (qrScannerRef.current) {
      qrScannerRef.current.stop().catch(console.error);
    }
    
    // יצירת מופע חדש של סורק QR לסריקת תמונה
    const html5QrCode = new Html5Qrcode(scannerContainerId);
    
    // סריקת קובץ התמונה
    html5QrCode.scanFile(file, /* showImage */ true)
      .then(decodedText => {
        handleSuccessfulScan(decodedText);
      })
      .catch(error => {
        console.error("שגיאה בסריקת קובץ:", error);
        toast({
          title: "לא נמצא קוד QR",
          description: "לא ניתן לזהות קוד QR בתמונה שהועלתה. נא לנסות שוב.",
          variant: "destructive"
        });
        
        // הפעלה מחדש של סורק המצלמה החי
        setTimeout(() => {
          if (isOpen && qrScannerRef.current) {
            qrScannerRef.current.start(
              { facingMode: "environment" },
              { fps: 10, qrbox: { width: 250, height: 250 } },
              (text) => handleSuccessfulScan(text),
              (err) => console.log(err)
            ).catch(console.error);
          }
        }, 1000);
      });
  }, [handleSuccessfulScan, isOpen, toast]);

  // הדמיית סריקת QR לצורך בדיקות
  const simulateScan = useCallback(() => {
    toast({
      title: "מדמה סריקת QR",
      description: "בסביבת ייצור, זה יסרוק קוד QR אמיתי"
    });
    
    const testBusinessIds = ["coffee", "attire", "restaurant"];
    const randomBusinessId = testBusinessIds[Math.floor(Math.random() * testBusinessIds.length)];
    handleSuccessfulScan(randomBusinessId);
  }, [handleSuccessfulScan, toast]);

  return (
    <QRScannerContext.Provider value={{ isOpen, openScanner, closeScanner }}>
      {children}

      {isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 rtl">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-4 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold">סרוק קוד QR</h3>
              <Button variant="ghost" size="icon" onClick={closeScanner}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="p-4">
              {/* אזור לסורק QR - מסגרת גדולה יותר */}
              <div 
                id={scannerContainerId}
                className="bg-gray-100 dark:bg-gray-900 rounded-lg aspect-square w-full max-w-sm mx-auto flex items-center justify-center overflow-hidden"
              >
                {/* מסגרת סריקה גדולה יותר */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* מסגרת לבנה עם פינות לעיצוב */}
                  <div className="absolute inset-[10%] border-0 z-20">
                    {/* פינות בולטות גדולות יותר */}
                    <div className="absolute top-0 right-0 w-14 h-14 border-t-4 border-r-4 border-white"></div>
                    <div className="absolute top-0 left-0 w-14 h-14 border-t-4 border-l-4 border-white"></div>
                    <div className="absolute bottom-0 right-0 w-14 h-14 border-b-4 border-r-4 border-white"></div>
                    <div className="absolute bottom-0 left-0 w-14 h-14 border-b-4 border-l-4 border-white"></div>
                  </div>
                  {/* שטח שקוף באמצע */}
                  <div className="w-full h-full flex items-center justify-center z-10">
                    <p className="text-white text-sm text-center drop-shadow-md font-medium">
                      מקם את קוד ה-QR בתוך המסגרת
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                סרוק את קוד ה-QR בעסק על מנת לשתף את ההמלצה שלך
              </p>
            </div>
          </div>
        </div>
      )}
    </QRScannerContext.Provider>
  );
};
