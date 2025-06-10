  <button
    onClick={handleSave}
    className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500"
    disabled={isSaved}
  >
    <Heart className={`w-4 h-4 ${isSaved ? 'text-red-500' : ''}`} />
    שמירה
  </button> 