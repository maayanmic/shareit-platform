import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRating?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({ 
  rating, 
  onRating, 
  readonly = false, 
  size = "md",
  className 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  const handleClick = (starRating: number) => {
    console.log(`Star clicked: ${starRating}, readonly: ${readonly}, onRating exists: ${!!onRating}`);
    if (readonly || !onRating) {
      console.log('Click blocked - readonly or no onRating function');
      return;
    }
    console.log(`דירוג נלחץ: ${starRating}`);
    onRating(starRating);
  };

  const handleMouseEnter = (starRating: number) => {
    if (readonly) return;
    setHoverRating(starRating);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
    setIsHovering(false);
  };

  const getStarColor = (starIndex: number) => {
    const currentRating = isHovering ? hoverRating : rating;
    
    if (starIndex <= currentRating) {
      return "text-yellow-400 fill-yellow-400";
    }
    return "text-gray-300 dark:text-gray-600";
  };

  return (
    <div className={cn("flex items-center gap-1", className)} onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((starIndex) => (
        <button
          key={starIndex}
          type="button"
          disabled={readonly}
          className={cn(
            "p-0 border-none bg-transparent outline-none focus:outline-none",
            !readonly && "cursor-pointer hover:scale-110 transition-transform duration-150"
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClick(starIndex);
          }}
          onMouseEnter={() => handleMouseEnter(starIndex)}
        >
          <Star
            className={cn(
              sizeClasses[size],
              getStarColor(starIndex)
            )}
          />
        </button>
      ))}
      {!readonly && (
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
          {isHovering ? hoverRating : rating}/5
        </span>
      )}
    </div>
  );
} 