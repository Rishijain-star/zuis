import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp, Award, Check, X, Brain, BookOpen, Clock, Zap, Badge } from 'lucide-react';

const PerformanceOverviewCard = ({
  totalQuestions,
  correctAnswers,
  incorrectAnswers,
  missedAnswers,
  totalQuestionsInSystem,
  timeTaken
}) => {
  // Calculate percentages
  const questionsCompletedPercentage = Math.round((totalQuestions / totalQuestionsInSystem) * 100) || 0;
  const questionsRemainingPercentage = 100 - questionsCompletedPercentage;
  const correctPercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const incorrectPercentage = totalQuestions > 0 ? Math.round(((incorrectAnswers + missedAnswers) / totalQuestions) * 100) : 0;

  // Ensure percentages add up to 100%
  const adjustedCorrectPercentage = correctPercentage + incorrectPercentage > 100 ? 
    100 - incorrectPercentage : correctPercentage;
  const adjustedIncorrectPercentage = correctPercentage + incorrectPercentage > 100 ? 
    100 - correctPercentage : incorrectPercentage;

  // Prepare data for the pie charts
  const completionData = [
    { name: 'Completed', value: questionsCompletedPercentage, color: '#3b82f6' },
    { name: 'Remaining', value: questionsRemainingPercentage, color: '#e2e8f0' }
  ];

  const accuracyData = [
    { name: 'Correct', value: correctAnswers, color: '#22c55e' },
    { name: 'Incorrect', value: incorrectAnswers + missedAnswers, color: '#ef4444' }
  ];

  // Format time taken
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Calculate performance rating
  const getPerformanceRating = () => {
    if (correctPercentage >= 90) return { text: 'Exceptional', color: 'bg-emerald-500 text-white' };
    if (correctPercentage >= 80) return { text: 'Excellent', color: 'bg-green-500 text-white' };
    if (correctPercentage >= 70) return { text: 'Very Good', color: 'bg-blue-500 text-white' };
    // if (correctPercentage >= 60) return { text: 'Good', color: 'bg-blue-400 text-white' };
    // if (correctPercentage >= 50) return { text: 'Satisfactory', color: 'bg-yellow-500 text-white' };
    if (correctPercentage >= 40) return { text: 'Fair', color: 'bg-orange-500 text-white' };
    return { text: 'Needs Work', color: 'bg-red-500 text-white' };
  };

  const performanceRating = getPerformanceRating();

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="p-6 max-w-7xl mx-auto">
        {/* Header with performance rating */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            Performance Overview
          </h3>
          <Badge className={`${performanceRating.color} px-4 py-1.5 text-sm font-medium rounded-full shadow-sm`}>
            {performanceRating.text}
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Questions Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 shadow-md border border-blue-200 hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-blue-700 font-medium mb-2">Total Questions</div>
                <div className="text-3xl font-bold text-blue-900">{totalQuestions}</div>
                <div className="text-xs text-blue-700 mt-2">{questionsCompletedPercentage} of library</div>
              </div>
              <div className="bg-blue-200 rounded-full p-2.5 text-blue-600 shadow-inner">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          {/* Remaining Questions Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-5 shadow-md border border-indigo-200 hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-indigo-700 font-medium mb-2">Remaining</div>
                <div className="text-3xl font-bold text-indigo-900">{totalQuestionsInSystem - totalQuestions}</div>
                <div className="text-xs text-indigo-700 mt-2">{questionsRemainingPercentage} of library</div>
              </div>
              <div className="bg-indigo-200 rounded-full p-2.5 text-indigo-600 shadow-inner">
                <Brain className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          {/* Correct Answers Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 shadow-md border border-green-200 hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-green-700 font-medium mb-2">Correct</div>
                <div className="text-3xl font-bold text-green-900">{correctAnswers}</div>
                <div className="text-xs text-green-700 mt-2">{correctPercentage} accuracy</div>
              </div>
              <div className="bg-green-200 rounded-full p-2.5 text-green-600 shadow-inner">
                <Check className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          {/* Incorrect Answers Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 shadow-md border border-red-200 hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-red-700 font-medium mb-2">Incorrect</div>
                <div className="text-3xl font-bold text-red-900">{incorrectAnswers + missedAnswers}</div>
                <div className="text-xs text-red-700 mt-2">{incorrectPercentage} of attempted</div>
              </div>
              <div className="bg-red-200 rounded-full p-2.5 text-red-600 shadow-inner">
                <X className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          {/* Completion Progress Chart */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl p-5 shadow-md border hover:shadow-lg transition-all"
          >
            <h4 className="text-sm font-medium text-slate-700 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full p-1.5 mr-2 shadow-inner">
                <BookOpen className="w-4 h-4" />
              </span>
              Content Completion
            </h4>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <filter id="shadow-completion" height="200%">
                      <feDropShadow dx="0" dy="0" stdDeviation="3" floodOpacity="0.3" />
                    </filter>
                  </defs>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}`}
                    labelLine={false}
                    animationBegin={0}
                    animationDuration={1500}
                    filter="url(#shadow-completion)"
                  >
                    {completionData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}`, '']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center" 
                    layout="horizontal"
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-xs font-medium text-slate-700">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-xs text-slate-500 mt-3 bg-slate-50 py-2 px-3 rounded-xl">
              You've completed {totalQuestions} of {totalQuestionsInSystem} total questions 
            </div>
          </motion.div>

          {/* Accuracy Chart */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-md border hover:shadow-lg transition-all"
          >
            <h4 className="text-sm font-medium text-slate-700 mb-4 flex items-center">
              <span className="bg-green-100 text-green-600 rounded-full p-1.5 mr-2 shadow-inner">
                <Check className="w-4 h-4" />
              </span>
              Answer Accuracy
            </h4>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <filter id="shadow-accuracy" height="200%">
                      <feDropShadow dx="0" dy="0" stdDeviation="3" floodOpacity="0.3" />
                    </filter>
                  </defs>
                  <Pie
                    data={accuracyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}`}
                    labelLine={false}
                    animationBegin={0}
                    animationDuration={1500}
                    filter="url(#shadow-accuracy)"
                  >
                    {accuracyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}`, '']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center" 
                    layout="horizontal"
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-xs font-medium text-slate-700">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-xs text-slate-500 mt-3 bg-slate-50 py-2 px-3 rounded-xl">
              {correctAnswers} correct, {incorrectAnswers + missedAnswers} incorrect of {totalQuestions} attempted
            </div>
          </motion.div>
        </div>

        {/* Additional performance metrics */}
        <div className="flex flex-wrap gap-4 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center px-5 py-2.5 bg-amber-50 border border-amber-200 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <span className="bg-amber-200 text-amber-600 rounded-full p-1.5 mr-2 shadow-inner">
              <Clock className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-amber-800">Test Time: {formatTime(timeTaken)}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center px-5 py-2.5 bg-purple-50 border border-purple-200 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <span className="bg-purple-200 text-purple-600 rounded-full p-1.5 mr-2 shadow-inner">
              <Zap className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-purple-800">Avg. {timeTaken > 0 && totalQuestions > 0 ? (timeTaken / totalQuestions).toFixed(1) : 0}s per question</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center px-5 py-2.5 bg-teal-50 border border-teal-200 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <span className="bg-teal-200 text-teal-600 rounded-full p-1.5 mr-2 shadow-inner">
              <Award className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-teal-800">
            Performance score: 0
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceOverviewCard;
