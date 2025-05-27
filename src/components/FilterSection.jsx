import React from 'react';
import { Button } from './ui/button';
import { Filter, Check, X, Flag } from 'lucide-react';

const FilterSection = ({ activeFilter, setActiveFilter }) => {
  return (
    <div className="mt-6 bg-white rounded-2xl p-5 border shadow-md hover:shadow-lg transition-all">
      <h4 className="text-sm font-medium text-gray-700 text-center mb-4 flex items-center justify-center">
        <Filter className="h-4 w-4 mr-2 text-blue-500" />
        Filter Questions By Result
      </h4>
      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-4 w-full max-w-xl">
          <Button 
            variant={activeFilter === "correct" ? "default" : "outline"}
            className={`relative rounded-full transition-all duration-200 shadow-md hover:shadow-lg ${
              activeFilter === "correct" 
                ? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-medium" 
                : "border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
            }`}
            onClick={() => setActiveFilter(activeFilter === "correct" ? "all" : "correct")}
          >
            <span className="flex items-center justify-center">
              <span className="bg-green-200 text-green-600 rounded-full p-1 mr-2 shadow-inner">
                <Check className="h-4 w-4" />
              </span>
              Correct
            </span>
          </Button>
          <Button 
            variant={activeFilter === "incorrect" ? "default" : "outline"}
            className={`relative rounded-full transition-all duration-200 shadow-md hover:shadow-lg ${
              activeFilter === "incorrect" 
                ? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-medium" 
                : "border-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
            }`}
            onClick={() => setActiveFilter(activeFilter === "incorrect" ? "all" : "incorrect")}
          >
            <span className="flex items-center justify-center">
              <span className="bg-red-200 text-red-600 rounded-full p-1 mr-2 shadow-inner">
                <X className="h-4 w-4" />
              </span>
              Incorrect
            </span>
          </Button>
          <Button 
            variant={activeFilter === "flagged" ? "default" : "outline"}
            className={`relative rounded-full transition-all duration-200 shadow-md hover:shadow-lg ${
              activeFilter === "flagged" 
                ? "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-medium" 
                : "border-2 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300"
            }`}
            onClick={() => setActiveFilter(activeFilter === "flagged" ? "all" : "flagged")}
          >
            <span className="flex items-center justify-center">
              <span className="bg-amber-200 text-amber-600 rounded-full p-1 mr-2 shadow-inner">
                <Flag className="h-4 w-4" />
              </span>
              Flagged
            </span>
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="bg-sky-50 text-sky-800 text-center text-xs p-2 rounded-md mt-4 border border-sky-200 w-full max-w-sm leading-relaxed">
          {activeFilter === "all" ? "All Questions" : 
           activeFilter === "correct" ? "Correct Answers" : 
           activeFilter === "incorrect" ? "Incorrect Answers" : 
           "Flagged Questions"}
        </div>
      </div>
    </div>
  );
};

export default FilterSection;