import { useState } from 'react';
import { DesktopNavigation } from "@/components/layout/DesktopNavigation";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  MapPin, 
  Coffee, 
  ShoppingBag, 
  Utensils, 
  Scissors, 
  Palette, 
  Briefcase 
} from "lucide-react";

// Sample list of businesses for the discover page
const businesses = [
  {
    id: 'business1',
    name: 'Coffee Workshop',
    category: 'Cafe',
    description: 'Artisanal coffee shop with freshly roasted beans and homemade pastries',
    address: '123 Main St, Downtown',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400',
    discountOffered: 10,
    icon: <Coffee className="h-5 w-5" />
  },
  {
    id: 'business2',
    name: 'Urban Attire',
    category: 'Fashion',
    description: 'Sustainable and stylish clothing for modern professionals',
    address: '456 Fashion Ave, Uptown',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400',
    discountOffered: 15,
    icon: <ShoppingBag className="h-5 w-5" />
  },
  {
    id: 'business3',
    name: 'Fresh & Local',
    category: 'Restaurant',
    description: 'Farm-to-table restaurant featuring seasonal ingredients from local farmers',
    address: '789 Organic Lane, West Side',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400',
    discountOffered: 20,
    icon: <Utensils className="h-5 w-5" />
  },
  {
    id: 'business4',
    name: 'Classy Cuts',
    category: 'Salon',
    description: 'Premium hair salon with expert stylists and personalized service',
    address: '321 Style Blvd, East End',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400',
    discountOffered: 12,
    icon: <Scissors className="h-5 w-5" />
  },
  {
    id: 'business5',
    name: 'Creative Space',
    category: 'Art Gallery',
    description: 'Contemporary art gallery showcasing works from emerging local artists',
    address: '555 Canvas Road, Arts District',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1594784237741-f516df67b38d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400',
    discountOffered: 15,
    icon: <Palette className="h-5 w-5" />
  },
  {
    id: 'business6',
    name: 'Tech Innovations',
    category: 'Tech Shop',
    description: 'Cutting-edge technology products and expert repair services',
    address: '888 Digital Drive, Tech Park',
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1593642702909-dec73df255d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400',
    discountOffered: 10,
    icon: <Briefcase className="h-5 w-5" />
  }
];

// Category filters
const categories = [
  { id: 'all', name: 'All', icon: null },
  { id: 'cafe', name: 'Cafes', icon: <Coffee className="h-4 w-4 mr-1" /> },
  { id: 'fashion', name: 'Fashion', icon: <ShoppingBag className="h-4 w-4 mr-1" /> },
  { id: 'restaurant', name: 'Restaurants', icon: <Utensils className="h-4 w-4 mr-1" /> },
  { id: 'salon', name: 'Salons', icon: <Scissors className="h-4 w-4 mr-1" /> },
  { id: 'art', name: 'Art & Culture', icon: <Palette className="h-4 w-4 mr-1" /> }
];

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter businesses based on search query and selected category
  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      business.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                          business.category.toLowerCase().includes(selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  // Render stars for rating
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <svg 
        key={i} 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-accent-500' : 'text-gray-300 dark:text-gray-600'}`} 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <DesktopNavigation />
      
      <div className="container mx-auto pt-4 md:pt-20 pb-24 md:pb-8 px-4">
        <div className="flex flex-col space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold">Discover Businesses</h1>
          
          {/* Search & Filter Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search businesses by name or description"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button>Search</Button>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  className="flex items-center"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.icon}
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Businesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map(business => (
              <div 
                key={business.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-md transition duration-300"
              >
                <div className="relative">
                  <img 
                    src={business.image} 
                    alt={business.name} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                    {business.discountOffered}% OFF
                  </div>
                  <div className="absolute bottom-3 left-3 bg-white dark:bg-gray-800 rounded-full px-2 py-1 text-xs font-medium flex items-center">
                    {business.icon}
                    <span className="ml-1">{business.category}</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{business.name}</h3>
                    <div className="flex items-center">
                      {renderStars(business.rating)}
                      <span className="ml-1 text-xs text-gray-500">{business.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{business.description}</p>
                  
                  <div className="mt-3 flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{business.address}</span>
                  </div>
                  
                  <Button className="w-full mt-4">
                    View Business
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Empty state if no results */}
          {filteredBusinesses.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium">No businesses found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <MobileBottomNav />
    </div>
  );
}
