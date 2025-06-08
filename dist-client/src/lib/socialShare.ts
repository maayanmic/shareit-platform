// פונקציות לשיתוף תוכן ברשתות חברתיות

// שיתוף בפייסבוק
export function shareToFacebook(recommendationUrl: string, description?: string, imageUrl?: string) {
  // פתרון חלופי לסביבת פיתוח - נשתמש בלינק ישיר במקום SDK
  // בסביבת ייצור זה יתחבר לאפליקציית פייסבוק רשומה
  return new Promise((resolve, reject) => {
    try {
      // יוצרים URL לדיאלוג השיתוף הפשוט
      const fbUrl = new URL('https://www.facebook.com/sharer/sharer.php');
      
      // מוסיפים פרמטרים לקישור
      fbUrl.searchParams.append('u', recommendationUrl || window.location.href);
      
      if (description) {
        fbUrl.searchParams.append('quote', description);
      }
      
      // פותחים את החלון בגודל מותאם
      const width = 550;
      const height = 450;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const shareWindow = window.open(
        fbUrl.toString(),
        'שתף בפייסבוק',
        `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
      );
      
      // נחשיב את השיתוף כמוצלח כשהחלון נפתח
      if (shareWindow) {
        console.log('חלון שיתוף פייסבוק נפתח בהצלחה');
        
        // אם המשתמש סוגר את החלון נחשיב זאת כהצלחה
        const timer = setInterval(() => {
          if (shareWindow.closed) {
            clearInterval(timer);
            resolve({ success: true });
          }
        }, 1000);
        
        resolve({ success: true });
      } else {
        console.error('לא ניתן לפתוח את חלון השיתוף. ייתכן שחוסם חלונות קופצים מופעל.');
        reject(new Error('לא ניתן לפתוח את חלון השיתוף'));
      }
    } catch (error) {
      console.error('שגיאה בשיתוף לפייסבוק:', error);
      reject(error);
    }
  });
}

// שיתוף באינסטגרם - רק למטרות הדגמה
export function shareToInstagram(imageUrl: string, caption?: string) {
  return new Promise((resolve, reject) => {
    try {
      // אינסטגרם לא תומך בשיתוף ישיר מדפדפן, פונקציה זו רק למטרות הדגמה
      alert('שיתוף לאינסטגרם אינו זמין כעת, זו רק הדגמה');
      resolve({ success: false, message: 'פונקציה לא זמינה' });
    } catch (error) {
      console.error('שגיאה בשיתוף לאינסטגרם:', error);
      reject(error);
    }
  });
}

// שיתוף בטוויטר - רק למטרות הדגמה
export function shareToTwitter(text: string, url: string, hashtags?: string[]) {
  return new Promise((resolve, reject) => {
    try {
      // פונקציה זו רק למטרות הדגמה
      alert('שיתוף לטוויטר אינו זמין כעת, זו רק הדגמה');
      resolve({ success: false, message: 'פונקציה לא זמינה' });
    } catch (error) {
      console.error('שגיאה בשיתוף לטוויטר:', error);
      reject(error);
    }
  });
}

// הוסף תמיכה בחלון פייסבוק
declare global {
  interface Window {
    FB: {
      init: (options: any) => void;
      ui: (options: any, callback: (response: any) => void) => void;
    };
  }
}