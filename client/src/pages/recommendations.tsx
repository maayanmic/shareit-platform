import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBusinesses, Business } from "@/hooks/use-businesses";
import RecommendationCard from "@/components/recommendation/recommendation-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Filter } from "lucide-react";

export default function Recommendations() {
  const { user } = useAuth();
  const { businesses, isLoading } = useBusinesses();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBusinesses = businesses ? (searchTerm 
    ? businesses.filter(business => 
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (business.category && business.category.toLowerCase().includes(searchTerm.toLowerCase()))
      ) 
    : businesses) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">המלצות</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="חיפוש המלצות..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            סינון
          </Button>
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
          {filteredBusinesses.map((business) => (
            <RecommendationCard
              key={business.id}
              id={business.id}
              businessName={business.name || ""}
              businessImage={business.image || ""}
              description={business.description || ""}
              discount={business.discount || "0%"}
              rating={business.rating || 4}
              recommenderName={business.recommendedBy || "משתמש"}
              recommenderPhoto={business.recommendedByPhoto || ""}
              recommenderId={business.recommendedById || "user1"}
              validUntil={business.validUntil || "30 ביוני"}
              savedCount={business.savedCount || 0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">לא נמצאו המלצות</p>
        </div>
      )}
    </div>
  );
}
