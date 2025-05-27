import { Activity, CheckCircle, Play, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";

// Animation wrapper (simplified)
export const QuestionModal = ({ isOpen, onClose, category, type, count }) => {
    const [selectedCount, setSelectedCount] = useState(count);
    const [difficulty, setDifficulty] = useState([]);
    const [flagged, setFlagged] = useState(false);
    
    if (!isOpen) return null;
    
    const difficultyOptions = [
      { label: 'Easy', value: 'easy' },
      { label: 'Medium', value: 'medium' },
      { label: 'Hard', value: 'hard' }
    ];
    
    const toggleDifficulty = (value) => {
      if (difficulty.includes(value)) {
        setDifficulty(difficulty.filter(d => d !== value));
      } else {
        setDifficulty([...difficulty, value]);
      }
    };
    
    return (  <>
    
      <div 
        className="fixed inset-0  p-4 transition-opacity duration-300"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              {type === 'correct' ? (
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="mr-2 h-5 w-5 text-red-500" />
              )}
              {type === 'correct' ? 'Correct' : 'Incorrect'} Questions
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full h-8 w-8 p-0"
              onClick={onClose}
            >
              ✕
            </Button>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              {count} {type === 'correct' ? 'correct' : 'incorrect'} questions in <span className="font-medium">{category}</span>
            </p>
            
            {/* Question Count Slider */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of questions to practice:
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="1"
                  max={count}
                  value={selectedCount}
                  onChange={(e) => setSelectedCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="w-10 text-center font-medium text-gray-800">{selectedCount}</span>
              </div>
            </div>
            
            {/* Difficulty Options */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level:
              </label>
              <div className="flex flex-wrap gap-2">
                {difficultyOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={difficulty.includes(option.value) ? "default" : "outline"}
                    size="sm"
                    className={`rounded-full px-4 ${
                      difficulty.includes(option.value) 
                        ? "bg-blue-600 text-white" 
                        : "border-blue-200 text-blue-700 hover:bg-blue-50"
                    }`}
                    onClick={() => toggleDifficulty(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Flagged Option */}
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="flagged"
                checked={flagged}
                onChange={() => setFlagged(!flagged)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="flagged" className="ml-2 block text-sm text-gray-700">
                Only include flagged questions
              </label>
            </div>
          </div>
          
          <div className="space-y-3 mt-6">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-xl h-12 shadow-md hover:shadow-lg transition-all">
              <Play className="mr-2 h-4 w-4" />
              Practice Selected Questions
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
    );
  };