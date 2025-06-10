import React from 'react';
import { Heart } from 'lucide-react';
import { useState } from 'react';

const [isSaved, setIsSaved] = useState(false);
const handleSave = async () => {
  if (isSaved) return;
  // Logic to save the recommendation
  await saveRecommendation(recommendationId);
  setIsSaved(true);
};

const saveRecommendation = async (id) => {
  // Logic to save the recommendation to the database
  console.log(`Saving recommendation with ID: ${id}`);
};

const recommendationId = 'some-recommendation-id'; // Replace with actual ID

  <button
    onClick={handleSave}
    className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500"
    disabled={isSaved}
  >
    <Heart className={`w-4 h-4 ${isSaved ? 'text-red-500' : ''}`} />
    שמור
  </button> 