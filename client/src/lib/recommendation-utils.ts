// פונקציות עזר לעבודה עם המלצות

import { createRecommendation, uploadImage } from "./firebase";

/**
 * יוצר המלצה חדשה ושומר אותה במסד הנתונים
 * @param data מידע ההמלצה
 * @param imageFile קובץ התמונה (אופציונלי)
 * @returns אובייקט עם מידע ההמלצה לאחר השמירה
 */
export async function createAndSaveRecommendation(data: {
  businessId: string;
  businessName: string;
  businessImage?: string;
  text: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  rating?: number;
  discount?: string;
  imageUrl?: string;
}, imageFile?: File): Promise<any> {

  // אם יש קובץ תמונה, מעלה אותו תחילה
  let imageUrl = data.imageUrl;
  if (imageFile) {
    try {
      const imagePath = `recommendations/${data.userId}_${Date.now()}`;
      imageUrl = await uploadImage(imageFile, imagePath);
    } catch (error) {
      console.error("שגיאה בהעלאת תמונה:", error);
      // ממשיכים בתהליך גם אם יש שגיאה בהעלאת התמונה
    }
  }

  // יצירת אובייקט ההמלצה לשמירה
  const recommendationData = {
    ...data,
    imageUrl: imageUrl || data.imageUrl || '',
    rating: data.rating || 5,
    discount: data.discount || '10% הנחה',
    savedCount: 0,
    createdAt: new Date()
  };

  // שמירה במסד הנתונים
  const savedRecommendation = await createRecommendation(recommendationData);
  
  console.log("המלצה נשמרה בהצלחה:", savedRecommendation);
  
  // יצירת קישור ייחודי להמלצה - עכשיו משתמשים בשדה id שיצרנו
  const recommendationLink = generateRecommendationLink(savedRecommendation.id);
  
  return {
    ...savedRecommendation,
    recommendationLink
  };
}

/**
 * יוצר קישור ייחודי להמלצה
 * @param recommendationId מזהה ההמלצה
 * @returns קישור מלא להמלצה
 */
export function generateRecommendationLink(recommendationId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/recommendation/${recommendationId}`;
}

/**
 * מחזיר את מזהה ההמלצה מתוך קישור
 * @param url קישור להמלצה
 * @returns מזהה ההמלצה או null אם לא נמצא
 */
export function extractRecommendationIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // מחפש את המקטע האחרון בנתיב שאמור להיות מזהה ההמלצה
    const recommendationId = pathParts[pathParts.length - 1];
    
    if (recommendationId && recommendationId !== 'recommendation') {
      return recommendationId;
    }
    
    return null;
  } catch (error) {
    console.error("שגיאה בניתוח קישור המלצה:", error);
    return null;
  }
}