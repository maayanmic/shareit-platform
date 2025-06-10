import { Star } from "lucide-react";

interface ClickableStarsProps {
  rating: number;
  onRating?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ClickableStars({ 
  rating, 
  onRating, 
  readonly = false, 
  size = "md"
}: ClickableStarsProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  const handleStarClick = (starNumber: number, event: any) => {
    console.log(`=== STAR CLICK DEBUG ===`);
    console.log(`Star number: ${starNumber}`);
    console.log(`Readonly: ${readonly}`);
    console.log(`Has onRating: ${!!onRating}`);
    console.log(`Event:`, event);
    
    if (readonly) {
      console.log('Blocked: readonly is true');
      return;
    }
    
    if (!onRating) {
      console.log('Blocked: no onRating function');
      return;
    }
    
    console.log(`Calling onRating with: ${starNumber}`);
    onRating(starNumber);
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((starNumber) => (
        <span
          key={starNumber}
          className={`
            inline-block
            ${!readonly ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
          `}
          onMouseDown={(e) => {
            e.preventDefault();
            console.log(`Mouse down on star ${starNumber}`);
            handleStarClick(starNumber, e);
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Click on star ${starNumber}`);
            handleStarClick(starNumber, e);
          }}
        >
          <Star
            className={`
              ${sizeClasses[size]}
              ${starNumber <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
            `}
          />
        </span>
      ))}
      <span className="text-xs text-gray-500 ml-2">
        {rating}/5
      </span>
    </div>
  );
}