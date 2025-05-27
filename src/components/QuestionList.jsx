import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { FileText, Eye } from 'lucide-react';
import QuestionCard from './QuestionCard';
import { getFlaggedIds } from '../data/testData';

const QuestionList = ({ testPairs, pairPerformance, activeFilter }) => {
  const filteredPairs = testPairs.filter(pair => {
    const performanceData = pairPerformance.current.find(p => p.pairId === pair.id);
    const isCorrect = performanceData ? performanceData.isCorrect : false;
    const flaggedIds = getFlaggedIds();
    const isFlagged = flaggedIds.includes(pair.id);

    if (activeFilter === "all") return true;
    if (activeFilter === "correct") return isCorrect;
    if (activeFilter === "incorrect") return !isCorrect;
    if (activeFilter === "flagged") return isFlagged;

    return true;
  });

  return (
    <div className="mt-6">
      <Card className="shadow-md hover:shadow-lg transition-all rounded-2xl overflow-hidden border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-500" />
            Question Review
          </CardTitle>
          <span className="text-sm text-gray-600 flex items-center">
            <Eye className="h-4 w-4 mr-1 text-gray-400" />
            Showing: <Badge variant="outline" className={`ml-1 font-normal rounded-full px-3 ${
              activeFilter === "flagged" ? "bg-amber-50 text-amber-700 border-amber-200" :
              activeFilter === "correct" ? "bg-green-50 text-green-700 border-green-200" :
              activeFilter === "incorrect" ? "bg-red-50 text-red-700 border-red-200" :
              "bg-blue-50 text-blue-700 border-blue-200"
            }`}>
              {activeFilter === "all" ? "All Questions" : 
               activeFilter === "correct" ? "Correct Answers" : 
               activeFilter === "incorrect" ? "Incorrect Answers" :
               "Flagged Questions"}
            </Badge>
          </span>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <div className="space-y-3">
            {filteredPairs.map((pair) => {
              const performanceData = pairPerformance.current.find(p => p.pairId === pair.id);
              const flaggedIds = getFlaggedIds();
              const isFlagged = flaggedIds.includes(pair.id);
              
              return (
                <QuestionCard
                  key={pair.id}
                  pair={pair}
                  performanceData={performanceData}
                  isFlagged={isFlagged}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionList;