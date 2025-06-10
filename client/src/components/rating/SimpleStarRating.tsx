import { Star } from "lucide-react";

interface SimpleStarRatingProps {
  rating: number;
  onRating?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function SimpleStarRating({ 
  rating, 
  onRating, 
  readonly = false, 
  size = "md"
}: SimpleStarRatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  const handleStarClick = (starNumber: number) => {
    console.log(`Simple star clicked: ${starNumber}, readonly: ${readonly}, has onRating: ${!!onRating}`);
    
    if (readonly || !onRating) {
      console.log('Click ignored - readonly or no callback');
      return;
    }
    
    console.log(`Calling onRating with: ${starNumber}`);
    onRating(starNumber);
  };

  return (
    <div className="flex items-center gap-1" style={{ zIndex: 10 }}>
      {[1, 2, 3, 4, 5].map((starNumber) => (
        <button
          key={starNumber}
          type="button"
          disabled={readonly}
          className={`
            border-none bg-transparent p-0 m-0 outline-none focus:outline-none
            ${!readonly ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
          `}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Button clicked for star ${starNumber}`);
            handleStarClick(starNumber);
          }}
          style={{ lineHeight: 0 }}
        >
          <Star
            className={`
              ${sizeClasses[size]}
              ${starNumber <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
            `}
            style={{ pointerEvents: 'none' }}
          />
        </button>
      ))}
      <span className="text-xs text-gray-500 ml-2">
        {rating}/5
      </span>
    </div>
  );
}