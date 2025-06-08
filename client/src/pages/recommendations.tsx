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

  // Sample data for when no actual data is available yet
  const sampleBusinesses = [
    {
      id: "coffee",
      name: "Coffee Workshop",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400",
      description: "Best specialty coffee in town, friendly staff and amazing pastries! Must try their cold brew.",
      discount: "10% OFF",
      rating: 4,
      location: "123 Main St, Anytown",
      category: "Coffee Shop",
      recommendedBy: "Alex Miller",
      recommendedByPhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40",
      recommendedById: "user1",
      validUntil: "Jun 30",
      savedCount: 23,
    },
    {
      id: "attire",
      name: "Urban Attire",
      image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400",
      description: "Amazing selection of sustainable fashion. The staff helped me find the perfect outfit for my interview!",
      discount: "15% OFF",
      rating: 5,
      location: "456 Fashion Ave, Styletown",
      category: "Clothing",
      recommendedBy: "Jessica Lee",
      recommendedByPhoto: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40",
      recommendedById: "user2",
      validUntil: "Jul 15",
      savedCount: 42,
    },
    {
      id: "restaurant",
      name: "Fresh & Local",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400",
      description: "Farm-to-table restaurant with seasonal menu. Their honey glazed salmon is a must-try. Great for date nights!",
      discount: "20% OFF",
      rating: 5,
      location: "789 Food Blvd, Tasteville",
      category: "Restaurant",
      recommendedBy: "Michael Chen",
      recommendedByPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40",
      recommendedById: "user3",
      validUntil: "Aug 1",
      savedCount: 17,
    },
    {
      id: "bakery",
      name: "Sweet Delights Bakery",
      image: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400",
      description: "The most delicious pastries and cakes in town. Their chocolate croissants are heavenly!",
      discount: "12% OFF",
      rating: 4,
      location: "321 Baker St, Sweetville",
      category: "Bakery",
      recommendedBy: "Emily Johnson",
      recommendedByPhoto: "https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40",
      recommendedById: "user4",
      validUntil: "Jul 20",
      savedCount: 31,
    },
    {
      id: "bookstore",
      name: "Page Turner Books",
      image: "https://images.unsplash.com/photo-1533327325824-76bc4e62d560?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400",
      description: "Cozy independent bookstore with amazing selection and knowledgeable staff. Great place to discover new authors!",
      discount: "15% OFF",
      rating: 5,
      location: "567 Read Ave, Booktown",
      category: "Bookstore",
      recommendedBy: "David Wilson",
      recommendedByPhoto: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40",
      recommendedById: "user5",
      validUntil: "Aug 15",
      savedCount: 28,
    },
    {
      id: "spa",
      name: "Tranquil Spa & Wellness",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400",
      description: "Perfect place for relaxation and self-care. Their deep tissue massage and facial treatments are exceptional!",
      discount: "25% OFF",
      rating: 5,
      location: "890 Calm St, Relaxtown",
      category: "Spa",
      recommendedBy: "Sophia Martinez",
      recommendedByPhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40",
      recommendedById: "user6",
      validUntil: "Sep 1",
      savedCount: 45,
    }
  ];

  // כאן נשתמש בבתי העסק האמיתיים אם קיימים, אחרת בנתוני הדוגמה
  const displayBusinesses = businesses && businesses.length > 0 ? businesses : sampleBusinesses;

  const filteredBusinesses = searchTerm 
    ? displayBusinesses.filter(business => 
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (business.category && business.category.toLowerCase().includes(searchTerm.toLowerCase()))
      ) 
    : displayBusinesses;

  return (
    <div className="flex flex-col space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
        <h1 className="text-2xl font-bold mb-4">Discover Local Businesses</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              type="text"
              placeholder="Search businesses by name or category..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="md:w-auto">
            <MapPin className="h-4 w-4 mr-2" />
            <span>Near Me</span>
          </Button>
          <Button variant="outline" className="md:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            <span>Filter</span>
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
          {filteredBusinesses.map((business: Business) => (
            <RecommendationCard
              key={business.id}
              id={business.id}
              businessName={business.name}
              businessImage={business.image}
              description={business.description}
              discount={business.discount}
              rating={business.rating || 4}
              recommenderName={business.recommendedBy || "משתמש"}
              recommenderPhoto={business.recommendedByPhoto || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=40&h=40&auto=format&fit=crop"}
              recommenderId={business.recommendedById || "user1"}
              validUntil={business.validUntil || "30 ביוני"}
              savedCount={business.savedCount || 0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">No businesses found</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search term or check back later for more businesses.
          </p>
        </div>
      )}
    </div>
  );
}
