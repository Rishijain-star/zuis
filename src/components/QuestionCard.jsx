import React from 'react';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/Collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  BookOpen, ImageIcon, Play, Search, ExternalLink, 
  ChevronDown, Star, Repeat 
} from 'lucide-react';
import { formatCategoryName } from '../data/testData';

const QuestionCard = ({ pair, performanceData, isFlagged }) => {
  const isCorrect = performanceData?.isCorrect;
 const  activeFilter = performanceData?.activeFilter;
  const hasNotes = pair.notes && (
    pair.notes.term1Notes || 
    pair.notes.term2Notes || 
    pair.notes.bulletPoints?.length || 
    pair.notes.explanation
  );
  const hasImage = pair.notes?.image;
  const hasVideo = pair.notes?.videoUrl;
  const hasExpandableContent = hasNotes || hasImage || hasVideo;

  const handleExpandCollapsible = (pairId) => {
    const collapsibleEl = document.getElementById(`collapsible-${pairId}`);
    if (collapsibleEl && !collapsibleEl.getAttribute('data-state')?.includes('open')) {
      const triggerEl = collapsibleEl.querySelector('[data-state="closed"]');
      if (triggerEl) {
        triggerEl.click();
      }
    }
  };

  const handleImageClick = (pairId) => {
    handleExpandCollapsible(pairId);
    setTimeout(() => {
      const imageEl = document.getElementById(`image-${pairId}`);
      if (imageEl) {
        imageEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };

  const handleVideoClick = (pairId) => {
    handleExpandCollapsible(pairId);
    setTimeout(() => {
      const videoEl = document.getElementById(`video-${pairId}`);
      if (videoEl) {
        videoEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };

  return (
    <Collapsible
      key={pair.id}
      id={`collapsible-${pair.id}`}
      className={`rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all mb-5 mx-2 ${
        isCorrect ? 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200' :
        'bg-gradient-to-r from-red-50 to-red-100 border border-red-200'
      }`}
    >
      <div className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex-1 mb-2 md:mb-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                {formatCategoryName(pair.category)}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                {pair.difficulty?.charAt(0)?.toUpperCase() + pair?.difficulty?.slice(1)}
              </span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-3 mt-1">
              <div className="p-3 px-4 bg-white rounded-xl shadow-sm border-2 border-blue-100 flex-1 hover:shadow-md transition-all">
                <div className="text-xs font-medium text-blue-500 mb-2 flex items-center">
                  <Search className="h-3 w-3 mr-1" />
                  Question
                </div>
                <div className="font-medium mb-2 text-gray-800">{pair.term1}</div>
                <div className="flex justify-end gap-1 mt-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-1 rounded-full text-blue-500 hover:bg-blue-50"
                    title="View question details"
                    onClick={() => handleExpandCollapsible(pair.id)}
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-7 w-7 p-1 rounded-full text-green-500 hover:bg-green-50 hover:text-green-600`}
                    title={pair.notes?.image ? "View image" : "No image available"}
                    disabled={!pair.notes?.image}
                    onClick={() => handleImageClick(pair.id)}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-7 w-7 p-1 rounded-full transition-all ${
                      pair.notes?.videoUrl 
                        ? 'text-purple-500 hover:bg-purple-50 hover:text-purple-600' 
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                    title={pair.notes?.videoUrl ? "View video" : "No video available"}
                    disabled={!pair.notes?.videoUrl}
                    onClick={() => handleVideoClick(pair.id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-3 px-4 bg-white rounded-xl shadow-sm border-2 border-green-100 flex-1 hover:shadow-md transition-all">
                <div className="text-xs font-medium text-green-500 mb-2 flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  Answer
                </div>
                <div className="font-medium mb-2 text-gray-800">{pair.term2}</div>
                <div className="flex justify-end gap-1 mt-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-1 rounded-full text-green-500 hover:bg-green-50"
                    title="View answer details"
                    onClick={() => handleExpandCollapsible(pair.id)}
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-1 rounded-full text-blue-500 hover:bg-blue-50"
                    title="Practice again"
                  >
                    <Repeat className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isCorrect 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {isCorrect ? 'Correct' : 'Incorrect'}
            </div>
            
            {hasExpandableContent && (
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
            )}
          </div>
        </div>
      </div>
      
      {hasExpandableContent && (
        <CollapsibleContent className="px-4 pb-4">
          <div className="bg-white rounded-xl p-4 border-2 border-gray-100 space-y-4">
            {pair.notes?.explanation && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Explanation</h5>
                <p className="text-sm text-gray-600">{pair.notes.explanation}</p>
              </div>
            )}
            
            {pair.notes?.bulletPoints?.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Key Points</h5>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {pair.notes.bulletPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {hasImage && (
              <div id={`image-${pair.id}`}>
                <h5 className="font-medium text-gray-700 mb-2">Image</h5>
                <img 
                  src={pair.notes.image} 
                  alt="Question related image" 
                  className="rounded-lg max-w-full h-auto"
                />
              </div>
            )}
            
            {hasVideo && (
              <div id={`video-${pair.id}`}>
                <h5 className="font-medium text-gray-700 mb-2">Video</h5>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2"
                    onClick={() => window.open(pair.notes.videoUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    {pair.notes.videoTitle || 'Watch Video'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};

export default QuestionCard;