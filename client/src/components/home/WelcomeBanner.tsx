import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Play, List } from "lucide-react";

export function WelcomeBanner() {
  return (
    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl overflow-hidden shadow-lg">
      <div className="px-6 pt-6 pb-10 md:pb-6 md:flex md:justify-between md:items-center">
        <div className="mb-6 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome to ShareIt!</h1>
          <p className="text-primary-50 text-sm md:text-base max-w-lg">
            Share recommendations about businesses you love, help friends discover great places, and earn rewards for every successful referral.
          </p>
          <div className="flex mt-4 space-x-4">
            <Button variant="default" className="bg-white hover:bg-gray-100 text-primary-600">
              <Play className="h-5 w-5 mr-2" />
              How It Works
            </Button>
            <Link href="/discover">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:bg-opacity-10">
                <List className="h-5 w-5 mr-2" />
                Browse Businesses
              </Button>
            </Link>
          </div>
        </div>
        <div className="hidden md:block ml-6">
          <img 
            src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=350&h=300" 
            alt="Social sharing illustration" 
            className="rounded-lg shadow-lg transform -rotate-6 transition duration-300 hover:rotate-0" 
          />
        </div>
      </div>
    </div>
  );
}
