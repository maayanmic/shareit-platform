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
  const isStoppingRef = useRef(false);
  
  // ניקוי סורק ה-QR כשהקומפוננטה נהרסת
  useEffect(() => {
    return () => {
      if (qrScannerRef.current && !isStoppingRef.current) {
        isStoppingRef.current = true;
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
        console.log("ברירת מחדל: ניווט לדף העסק");
      });
    }
  }, []);

  // סגירת חלון הסריקה
  const closeScanner = useCallback(async () => {
    if (isStoppingRef.current) return;
    
    isStoppingRef.current = true;
    
    if (qrScannerRef.current) {
      try {
        await qrScannerRef.current.stop();
      } catch (error) {
        console.log("Scanner stop error on close:", error);
      } finally {
        qrScannerRef.current = null;
        isStoppingRef.current = false;
      }
    } else {
      isStoppingRef.current = false;
    }
    setIsOpen(false);
  }, []);
  
  // פונקציה לטיפול בסריקה מוצלחת
  const handleSuccessfulScan = useCallback(async (decodedText: string) => {
    // בדיקה אם כבר בתהליך עצירה
    if (isStoppingRef.current) {
      console.log("Already stopping, ignoring scan");
      return;
    }
    
    isStoppingRef.current = true;
    
    // עצירה בטוחה של הסורק
    if (qrScannerRef.current) {
      try {
        await qrScannerRef.current.stop();
        console.log("Scanner stopped successfully");
      } catch (error) {
        console.log("Scanner stop error:", error);
      } finally {
        qrScannerRef.current = null;
      }
    }
    
    setIsOpen(false);
    
    console.log("קוד QR נסרק בהצלחה:", decodedText);
    console.log("מצב משתמש בסריקה:", user ? "מחובר" : "לא מחובר");
    
    try {
      // נסה לפרש את טקסט ה-QR כ-URL או מזהה של עסק
      let businessId = "";
      
      // בדוק אם התוצאה היא URL מלא
      if (decodedText.startsWith("http")) {
        console.log("מעבד URL:", decodedText);
        // חלץ את מזהה העסק מה-URL
        const url = new URL(decodedText);
        const paramBusinessId = url.searchParams.get("businessId");
        const pathSegments = url.pathname.split("/").filter(segment => segment.length > 0);
        
        // חפש "business" בנתיב ולקח את הפרמטר הבא
        console.log("מקטעי נתיב:", pathSegments);
        const businessIndex = pathSegments.findIndex(segment => segment === "business");
        console.log("אינדקס business:", businessIndex);
        
        let businessIdFromPath = "";
        if (businessIndex >= 0 && businessIndex < pathSegments.length - 1) {
          businessIdFromPath = pathSegments[businessIndex + 1];
        } else {
          // אם אין "business" בנתיב, קח את הפרמטר האחרון שאינו "scan"
          businessIdFromPath = pathSegments.filter(segment => segment !== "scan")[pathSegments.length - 1] || "";
        }
        console.log("מזהה עסק מהנתיב:", businessIdFromPath);
        
        businessId = paramBusinessId || businessIdFromPath || "";
        console.log("מזהה עסק שחולץ:", businessId);
        
        // נקה את מזהה העסק מפרמטרים נוספים
        if (businessId && businessId.includes("?")) {
          businessId = businessId.split("?")[0];
        }
        if (businessId && businessId.includes("#")) {
          businessId = businessId.split("#")[0];
        }
      } else {
        // אם זה לא URL, הנח שזה מזהה העסק עצמו
        businessId = decodedText;
        console.log("מזהה עסק ישיר:", businessId);
      }
      
      toast({
        title: "קוד QR נסרק בהצלחה",
        description: "מעבר לדף העסק...",
      });
      
      if (businessId) {
        console.log("מנווט לדף עסק:", `/business/${businessId}`);
        
        // קרא לפונקציית הקולבק
        onScanCallback(businessId);
        
        // ניווט לדף הסריקה שמכוון אליו ה-QR
        setLocation(`/business/${businessId}/scan`);
        
        // הודעת הצלחה לאחר הניווט
        setTimeout(() => {
          toast({
            title: "הופנית לדף העסק",
            description: "כעת תוכלי ליצור המלצה על העסק",
          });
          isStoppingRef.current = false;
        }, 500);
      } else {
        toast({
          title: "שגיאה",
          description: "מזהה עסק לא חוקי",
          variant: "destructive"
        });
        isStoppingRef.current = false;
      }
      
    } catch (error) {
      console.error("שגיאה בעיבוד קוד QR:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לעבד את קוד ה-QR. נא לנסות שוב.",
        variant: "destructive"
      });
      isStoppingRef.current = false;
    }
  }, [onScanCallback, setLocation, toast, user]);
  
  // פונקציה להפעלת סורק ה-QR כשהדיאלוג נפתח
  useEffect(() => {
    if (isOpen) {
      // ודא שהאלמנט קיים לפני שמנסים להתחיל את הסריקה
      setTimeout(() => {
        const scannerContainer = document.getElementById(scannerContainerId);
        if (!scannerContainer) return;
        
        // איפוס דגל העצירה
        isStoppingRef.current = false;
        
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
            // console.log(errorMessage);
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
    if (qrScannerRef.current && !isStoppingRef.current) {
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
          if (isOpen && !isStoppingRef.current) {
            qrScannerRef.current = new Html5Qrcode(scannerContainerId);
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </QRScannerContext.Provider>
  );
};