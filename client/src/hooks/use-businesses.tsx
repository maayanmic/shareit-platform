import { useQuery } from "@tanstack/react-query";
import { getBusinesses } from "@/lib/firebase";

// הגדרת טיפוס לבית עסק
export interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  address?: string;
  discount: string;
  rating?: number;
  location?: string;
  recommendedBy?: string;
  recommendedByPhoto?: string;
  recommendedById?: string;
  validUntil?: string;
  savedCount?: number;
}

// נתוני דוגמה של בתי עסק בעברית
const sampleBusinesses: Business[] = [
  {
    id: "1",
    name: "קפה טוב",
    category: "מסעדות",
    description: "בית קפה איכותי עם אוכל טעים ואווירה נעימה",
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=1000&auto=format&fit=crop",
    address: "רחוב הרצל 45, תל אביב",
    discount: "10% הנחה על כל התפריט",
    rating: 4.5,
    recommendedBy: "דני לוי",
    recommendedByPhoto: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=40&h=40&auto=format&fit=crop",
    validUntil: "30 ביוני",
    savedCount: 15
  },
  {
    id: "2",
    name: "חנות ספרים הישנה",
    category: "קמעונאות",
    description: "חנות ספרים עם מבחר עצום של ספרים חדשים ויד שניה",
    image: "https://images.unsplash.com/photo-1521123845560-14093637aa7d?q=80&w=1000&auto=format&fit=crop",
    address: "שדרות רוטשילד 22, תל אביב",
    discount: "ספר שני ב-50% הנחה",
    rating: 4.8,
    recommendedBy: "רונית שגב",
    recommendedByPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&auto=format&fit=crop",
    validUntil: "15 ביולי",
    savedCount: 23
  },
  {
    id: "3",
    name: "סטודיו יוגה",
    category: "בריאות וכושר",
    description: "סטודיו יוגה מודרני עם מדריכים מקצועיים",
    image: "https://images.unsplash.com/photo-1588286840104-8957b019727f?q=80&w=1000&auto=format&fit=crop",
    address: "רחוב שינקין 15, תל אביב",
    discount: "שיעור ניסיון ראשון בחינם",
    rating: 4.7,
    recommendedBy: "מיכל אברהמי",
    recommendedByPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&auto=format&fit=crop",
    validUntil: "1 באוגוסט",
    savedCount: 19
  },
  {
    id: "4",
    name: "מספרת לוי",
    category: "טיפוח",
    description: "מספרה מקצועית לגברים ונשים",
    image: "https://images.unsplash.com/photo-1572473694924-2c5b7b835e40?q=80&w=1000&auto=format&fit=crop",
    address: "רחוב דיזנגוף 120, תל אביב",
    discount: "15% הנחה על תספורת ראשונה",
    rating: 4.2,
    recommendedBy: "יוסי כהן",
    recommendedByPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&auto=format&fit=crop",
    validUntil: "20 ביולי",
    savedCount: 10
  },
  {
    id: "5",
    name: "חנות הנעליים",
    category: "אופנה",
    description: "חנות נעליים עם מבחר גדול לנשים, גברים וילדים",
    image: "https://images.unsplash.com/photo-1549971352-c31f2c34a14a?q=80&w=1000&auto=format&fit=crop",
    address: "קניון רמת אביב, תל אביב",
    discount: "20% הנחה על הזוג השני",
    rating: 4.4,
    recommendedBy: "נועה גרינברג",
    recommendedByPhoto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&auto=format&fit=crop",
    validUntil: "15 באוגוסט",
    savedCount: 28
  }
];

export function useBusinesses() {
  const { data: businesses, isLoading, error } = useQuery({
    queryKey: ['businesses'],
    queryFn: async () => {
      try {
        const data = await getBusinesses();
        if (data && data.length > 0) {
          return data as Business[];
        }
        throw new Error("No businesses found");
      } catch (error) {
        console.error("Error fetching businesses:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  return {
    businesses,
    isLoading,
    error
  };
}