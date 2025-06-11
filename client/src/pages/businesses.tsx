import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBusinesses, Business } from "@/hooks/use-businesses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Filter, MapPinIcon, PhoneIcon, Mail } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

// רכיב תצוגת בית עסק
function BusinessCard({ business }: { business: any }) {
  return (
    <Card className="overflow-hidden" style={{ direction: 'rtl' }}>
      <div className="relative h-48 flex justify-end">
        <img 
          src={business.logoUrl || business.image || "https://placehold.co/600x400?text=No+Image"} 
          alt={business.name} 
          className="w-full h-full object-cover rounded-t-lg"
        />
      </div>
      <CardContent className="p-4 text-right" style={{ direction: 'rtl' }}>
        <div className="mb-3">
          <h3 className="text-xl font-bold text-right w-full">{business.name}</h3>
          <div className="flex flex-row-reverse items-center justify-end gap-2 mb-1">
            {/* כאן אפשר להוסיף דירוג כוכבים אם יש */}
            {business.rating && (
              <span className="flex flex-row-reverse items-center justify-end gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < business.rating ? "text-yellow-400" : "text-gray-300"}>
                    ★
                  </span>
                ))}
              </span>
            )}
            <span className="text-sm text-gray-500 text-right">{business.category}</span>
          </div>
        </div>
        <p className="text-sm mb-4 text-left" style={{ direction: 'rtl', textAlign: 'left' }}>{business.description}</p>
        <div className="space-y-2 text-sm text-right">
          <div className="flex flex-row-reverse items-center justify-end">
            <span>{business.address}</span>
            <MapPinIcon className="h-4 w-4 ml-2 text-gray-500" />
          </div>
          <div className="flex flex-row-reverse items-center justify-end">
            <span>{business.phone}</span>
            <PhoneIcon className="h-4 w-4 ml-2 text-gray-500" />
          </div>
          <div className="flex flex-row-reverse items-center justify-end">
            <span>{business.email}</span>
            <Mail className="h-4 w-4 ml-2 text-gray-500" />
          </div>
        </div>
        <div className="flex flex-row-reverse justify-end gap-2 mt-4">
          <Link href={`/business/${business.id}`}>
            <Button variant="default" size="sm">
              צפייה בפרטים
            </Button>
          </Link>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                אהבתי
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">יתווסף בעתיד</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                שיתוף
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">יתווסף בעתיד</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
}

const categories = [
  "מסעדה",
  "בית קפה",
  "שירותים מקצועיים",
  "בריאות",
  "חינוך",
  "קמעונאות",
  "טכנולוגיה",
  "אחר"
];

export default function Businesses() {
  const { user } = useAuth();
  const { businesses, isLoading } = useBusinesses();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);

  // השתמש רק בנתונים האמיתיים מFirebase
  const displayBusinesses = businesses || [];

  const filteredBusinesses = displayBusinesses.filter(business => {
    const matchesSearch = searchTerm
      ? business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (business.category && business.category.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
    const matchesCategory = selectedCategory
      ? (business.categories && Array.isArray(business.categories)
          ? business.categories.includes(selectedCategory)
          : business.category === selectedCategory)
      : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
        <br></br>
        <h1 className="text-2xl font-bold mb-4 text-right">בתי עסק</h1>
        <div className="flex flex-col md:flex-row-reverse gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              type="text"
              placeholder="חפש עסק לפי שם, תיאור, כתובת או קטגוריה..."
              className="pr-10 text-left"
              style={{ direction: "rtl", textAlign: "left" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="md:w-auto flex flex-row-reverse items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>קרוב אלי</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">יתווסף בעתיד</TooltipContent>
          </Tooltip>
          <div className="relative">
            <Button
              variant="outline"
              className="md:w-auto flex flex-row-reverse items-center"
              onClick={() => setShowDropdown((v: boolean) => !v)}
              type="button"
            >
              <Filter className="h-4 w-4 mr-2" />
              <span>סינון</span>
            </Button>
            {showDropdown && (
              <div className="absolute z-10 right-0 mt-2 w-48 bg-white border rounded shadow-lg text-right">
                <div className="p-2 border-b font-bold">בחר קטגוריה</div>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`block w-full text-right px-4 py-2 hover:bg-gray-100 ${selectedCategory === cat ? 'bg-gray-200 font-bold' : ''}`}
                    onClick={() => { setSelectedCategory(cat); setShowDropdown(false); }}
                  >
                    {cat}
                  </button>
                ))}
                <button
                  className="block w-full text-right px-4 py-2 text-red-500 hover:bg-gray-100"
                  onClick={() => { setSelectedCategory(""); setShowDropdown(false); }}
                >
                  הסר סינון
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 h-96 animate-pulse">
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
              <div className="w-2/3 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="w-1/3 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="flex justify-between mb-4">
                <div className="w-1/4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-1/4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="flex space-x-2">
                <div className="w-1/2 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-1/4 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business: any) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md max-w-lg mx-auto">
          <Search className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-center">לא נמצאו בתי עסק</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
            נסה לשנות את מונחי החיפוש, לבחור קטגוריה אחרת, או לנקות את הסינון.
          </p>
          {(searchTerm || selectedCategory) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
              }}
            >
              נקה חיפוש וסינון
            </Button>
          )}
        </div>
      )}
    </div>
  );
}