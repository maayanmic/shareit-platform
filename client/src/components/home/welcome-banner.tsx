import { Link } from "wouter";
import { ArrowRight, PlayCircle, Library } from "lucide-react";

export default function WelcomeBanner() {
  return (
    <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl overflow-hidden shadow-lg">
      <div className="px-6 pt-6 pb-10 md:pb-6 md:flex md:justify-between md:items-center">
        <div className="mb-6 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-2 text-right">ברוכים הבאים ל-ShareIt!</h1>
          <p className="text-gray-800 text-sm md:text-base max-w-lg text-right">
            שתפו המלצות על עסקים שאתם אוהבים, עזרו לחברים לגלות מקומות נהדרים, וקבלו תגמולים על כל הפניה מוצלחת.
          </p>
          <div className="flex mt-4 space-x-4 flex-row-reverse">
            <button className="px-4 py-2 bg-white text-primary-600 rounded-lg font-medium shadow-sm hover:shadow-md transition duration-300 flex items-center">
              <PlayCircle className="h-5 w-5 ml-2" />
              איך זה עובד
            </button>
            <Link href="/recommendations">
              <button className="px-4 py-2 bg-transparent border border-white text-white rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition duration-300 flex items-center">
                <Library className="h-5 w-5 ml-2" />
                דפדפו בעסקים
              </button>
            </Link>
          </div>
        </div>
        <div className="hidden md:block ml-6">
          {/* Social sharing illustration */}
          <svg
            className="h-64 w-64 text-white opacity-80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.59 13.51L15.42 17.49"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15.41 6.51L8.59 10.49"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
