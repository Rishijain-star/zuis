import React, { useEffect, useRef, useState } from 'react';
import { 
  Brain, Activity, HeartPulse, 
  Microscope, Stethoscope, TrendingUp, 
  BarChart,
  Star,
  CheckCircle,
  XCircle,
  Database,
  FileText,
  AlertCircle,
  Clock
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Label, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { AnimatedDiv } from '../components/ui/animatediv';
import { DataTable } from '../components/ui/datatable';
import { Tooltip as TooltipComponent, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { motion } from 'framer-motion';
import PerformanceOverviewCard from '../components/PerformanceOverviewCard';
import FilterSection from '../components/FilterSection';
import QuestionList from '../components/QuestionList';
import { useNavigate, useParams } from 'react-router-dom';
import { basicScienceData, organSystemData, overallStats, specialtyData } from '../data/testData';

const OverallPerformanceView = () => {
  const statsRef = useRef(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeFilter, setActiveFilter] = useState('all');
  const { testId } = useParams();
  const navigate = useNavigate();
  
  // API Data States
  const [testDetail, setTestDetail] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({});
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({ current: 1, pages: 1, limit: 20 });
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [questionDetails, setQuestionDetails] = useState({});
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState({ category: '', type: '', count: 0 });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle question click for modal
  const handleQuestionClick = (category, type, count) => {
    setModalProps({ category, type, count });
    setModalOpen(true);
  };

  // Helper function to safely convert to number and handle NaN
  const safeNumber = (value, defaultValue = 0) => {
    const num = Number(value);
    return isNaN(num) || !isFinite(num) ? defaultValue : num;
  };

useEffect(() => {
  const fetchTestDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Fetch test session details
      const sessionResponse = await fetch(`https://synapaxon-backend.onrender.com/api/tests/${testId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!sessionResponse.ok) {
        throw new Error(`Failed to fetch test session: ${sessionResponse.statusText}`);
      }

      const sessionData = await sessionResponse.json();
      if (!sessionData.success) {
        throw new Error(sessionData.message || 'Test session not found');
      }

      // Fetch paginated questions (filtered)
      let query = `page=${pagination.current}&limit=${pagination.limit}`;
      if (filter !== 'all') {
        query += `&filter=${filter}`;
      }

      const questionsResponse = await fetch(`https://synapaxon-backend.onrender.com/api/student-questions/history/${testId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!questionsResponse.ok) {
        throw new Error(`Failed to fetch test questions: ${questionsResponse.statusText}`);
      }

      const questionsData = await questionsResponse.json();
        
      if (!questionsData.success) {
        throw new Error(questionsData.message || 'Failed to fetch test questions');
      }

      const questionsList = questionsData.data || [];

      setTestDetail(questionsList.data);
     
      setQuestions(questionsList);
      setPagination({
        current: questionsData.pagination?.current || 1,
        pages: questionsData.pagination?.pages || 1,
        limit: questionsData.pagination?.limit || 20,
      });

      // Compute analytics from the same paginated data
      if (questionsList.length > 0) {
        const categoryStats = questionsList.reduce((acc, q) => {
          const category = q.category || 'Unknown';
          if (!acc[category]) {
            acc[category] = { correct: 0, total: 0, incorrect: 0 };
          }
          acc[category].total += 1;
          if (q.isCorrect) acc[category].correct += 1;
          else acc[category].incorrect += 1;
          return acc;
        }, {});

        const subjectStats = questionsList.reduce((acc, q) => {
          const subject = q.question?.subject || 'Unknown';
          if (!acc[subject]) {
            acc[subject] = { correct: 0, total: 0, incorrect: 0 };
          }
          acc[subject].total += 1;
          if (q.isCorrect) acc[subject].correct += 1;
          else acc[subject].incorrect += 1;
          return acc;
        }, {});

        const questionStats = {
          correct: questionsList.filter(q => q.isCorrect).length,
          incorrect: questionsList.filter(q => !q.isCorrect && q.selectedAnswer !== -1).length,
          flagged: questionsList.filter(q => q.selectedAnswer === -1).length,
          avgTimePerQuestion: sessionData.data.completedAt
            ? (() => {
                const start = new Date(sessionData.data.startedAt);
                const end = new Date(sessionData.data.completedAt);
                const totalSeconds = (end - start) / 1000;
                return sessionData.data.totalQuestions > 0
                  ? Math.round(totalSeconds / sessionData.data.totalQuestions)
                  : 0;
              })()
            : 'N/A',
        };

        setAnalytics({ categoryStats, subjectStats, questionStats });
      }

      // Fetch additional question details
      const questionDetailsPromises = questionsList.map(async (question) => {
        try {
          const response = await fetch(`https://synapaxon-backend.onrender.com/api/questions/${question.question?._id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (response.ok) {
            const questionData = await response.json();
            if (questionData.success) {
              return { [question._id]: questionData.data };
            }
          }
          return { [question._id]: { explanation: 'No explanation available', media: null } };
        } catch (err) {
          console.error(`Error fetching details for question ${question._id}:`, err);
          return { [question._id]: { explanation: 'Error fetching explanation', media: null } };
        }
      });

      const questionDetailsArray = await Promise.all(questionDetailsPromises);
      const mergedQuestionDetails = questionDetailsArray.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setQuestionDetails(mergedQuestionDetails);
    } catch (err) {
      console.error('Error fetching test details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (testId) {
    fetchTestDetail();
  }
}, [testId, filter, pagination.current]);

  // Transform API data for charts
  const getCorrectVsIncorrectData = () => {
    
    if (!testDetail) return [];
    
    const correct = safeNumber(testDetail.isCorrect);
    const incorrect = safeNumber(!testDetail.isCorrect);
      console.log('incorrect',correct);
    return [
      { name: 'Correct', value: correct, color: '#10b981' },
      { name: 'Incorrect', value: incorrect, color: '#ef4444' },
    ];
  };

  const getUsedVsUnusedData = () => {
    if (!testDetail) return [];
    
    const totalInSystem = 1000; // You might want to fetch this from another API
    const totalQuestions = safeNumber(testDetail.totalQuestions);
    const unused = Math.max(0, totalInSystem - totalQuestions);
    
    return [
      { name: 'Used', value: totalQuestions, color: '#3b82f6' },
      { name: 'Unused', value: unused, color: '#9ca3af' }
    ];
  };

  // Updated function to generate stacked horizontal bar chart data with exact color codes
  const getSubjectPerformanceBarData = () => {
    // Using dummy data that matches your image structure
    return [
      { 
        subject: 'Sun', 
        direct: 320, 
        mailAd: 210, 
        affiliateAd: 310, 
        videoAd: 410, 
        searchEngine: 1320 
      },
      { 
        subject: 'Sat', 
        direct: 330, 
        mailAd: 230, 
        affiliateAd: 330, 
        videoAd: 330, 
        searchEngine: 1330 
      },
      { 
        subject: 'Fri', 
        direct: 390, 
        mailAd: 90, 
        affiliateAd: 290, 
        videoAd: 190, 
        searchEngine: 1290 
      },
      { 
        subject: 'Thu', 
        direct: 334, 
        mailAd: 134, 
        affiliateAd: 234, 
        videoAd: 154, 
        searchEngine: 934 
      },
      { 
        subject: 'Wed', 
        direct: 301, 
        mailAd: 101, 
        affiliateAd: 191, 
        videoAd: 201, 
        searchEngine: 901 
      },
      { 
        subject: 'Tue', 
        direct: 302, 
        mailAd: 132, 
        affiliateAd: 182, 
        videoAd: 212, 
        searchEngine: 832 
      },
      { 
        subject: 'Mon', 
        direct: 320, 
        mailAd: 120, 
        affiliateAd: 220, 
        videoAd: 150, 
        searchEngine: 820 
      },
    ];
  };

  // Transform analytics data for tables
  const getCategoryTableData = () => {
    if (!analytics.categoryStats) return [];
    return Object.entries(analytics.categoryStats).map(([name, stats]) => {
      const correct = safeNumber(stats.correct);
      const incorrect = safeNumber(stats.incorrect);
      const total = safeNumber(stats.total);
      const ratio = total > 0 ? Math.round((correct / total) * 100) : 0;
      
      return {
        name,
        correct,
        incorrect,
        ratio: safeNumber(ratio)
      };
    });
  };

  const getSubjectTableData = () => {
    if (!analytics.subjectStats) return [];
    return Object.entries(analytics.subjectStats).map(([name, stats]) => {
      const correct = safeNumber(stats.correct);
      const incorrect = safeNumber(stats.incorrect);
      const total = safeNumber(stats.total);
      const ratio = total > 0 ? Math.round((correct / total) * 100) : 0;
      
      return {
        name,
        correct,
        incorrect,
        ratio: safeNumber(ratio)
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const correctVsIncorrectData = getCorrectVsIncorrectData();
  const usedVsUnusedData = getUsedVsUnusedData();
  const categoryTableData = getCategoryTableData();
  const subjectTableData = getSubjectTableData();
  const subjectPerformanceBarData = getSubjectPerformanceBarData();

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Updated custom tooltip for stacked horizontal bar chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Safe calculation for pie chart percentages
  const getPercentage = (value1, value2) => {
    const total = safeNumber(value1) + safeNumber(value2);
    if (total === 0) return 0;
    return Math.round((safeNumber(value1) / total) * 100);
  };

  return (
    <TooltipProvider>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4 border-b">
          <TabsList className="mt-2">
            <TabsTrigger value="overview" className="flex items-center">
              <Activity className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="overall-overview" className="flex items-center">
              <BarChart className="mr-2 h-4 w-4" />
              Overall Overview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <PerformanceOverviewCard 
            totalQuestions={safeNumber(testDetail?.totalQuestions)}
            correctAnswers={safeNumber(testDetail?.correctAnswers)}
            incorrectAnswers={safeNumber(testDetail?.incorrectAnswers)}
            missedAnswers={safeNumber(testDetail?.flaggedAnswers)}
            totalQuestionsInSystem={testDetail?.totalQuestions}
            timeTaken={testDetail ? Math.round((new Date(testDetail.completedAt) - new Date(testDetail.startedAt)) / 1000) : 0}
          />
          
          <FilterSection 
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
          
          <QuestionList 
            testPairs={questions.map(item => ({
              id: item._id,
              term1: item.question.questionText,
              term2: item.options ? item.options[item.correctAnswer]?.text : '',
              category: item.category,
              activeFilter:activeFilter,
              difficulty: item.question.difficulty || 'medium',
              notes: {
                explanation: item.explanation,
                image: item.questionMedia && item.questionMedia[0] ? 
                  `https://synapaxon-backend.onrender.com${item.questionMedia[0].path}` : null
              }
            }))}
            pairPerformance={{ 
              current: questions.map(item => ({
                pairId: item._id,
                isCorrect: item.isCorrect,
                selectedAnswer: item.selectedAnswer
              }))
            }}
            activeFilter={activeFilter}
          />
        </TabsContent>

        <TabsContent value="overall-overview">
          <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="p-6 max-w-7xl mx-auto">
              <AnimatedDiv delay={1} className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col gap-4">
                    <AnimatedDiv
                      delay={1}
                      className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                    >
                      <h3 className="text-center text-sm font-medium text-gray-700 mb-2 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Correct vs Incorrect
                      </h3>
                      <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={correctVsIncorrectData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {correctVsIncorrectData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                              <Label
                                value={`${getPercentage(testDetail?.correctAnswers, testDetail?.incorrectAnswers)}%`}
                                position="center"
                                className="text-2xl font-bold"
                                fill="#333"
                              />
                            </Pie>
                            <Tooltip 
                              formatter={(value) => [`${safeNumber(value)} Questions`, '']}
                              labelFormatter={() => ''}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center space-x-6 ">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-xs text-gray-600">Correct</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            <span className="text-xs text-gray-600">Incorrect</span>
                          </div>
                        </div>
                      </div>
                    </AnimatedDiv>

                    <div className="grid grid-cols-2 gap-4">
                      <AnimatedDiv
                        delay={1}
                        className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-3 shadow-lg border border-green-200 hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center"
                      >
                        <div className="text-green-500 mb-1">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                        <div className="text-xs text-gray-600">Correct Answers</div>
                        <div className="text-xl font-bold mt-1 text-green-700">{safeNumber(testDetail?.correctAnswers).toLocaleString()}</div>
                      </AnimatedDiv>

                      <AnimatedDiv
                        delay={1}
                        className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-3 shadow-lg border border-red-200 hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center"
                      >
                        <div className="text-red-500 mb-1">
                          <XCircle className="h-6 w-6" />
                        </div>
                        <div className="text-xs text-gray-600">Incorrect Answers</div>
                        <div className="text-xl font-bold mt-1 text-red-700">{safeNumber(testDetail?.incorrectAnswers).toLocaleString()}</div>
                      </AnimatedDiv>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <AnimatedDiv
                      delay={1}
                      className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                    >
                      <h3 className="text-center text-sm font-medium text-gray-700 mb-2 flex items-center justify-center">
                        <Database className="h-4 w-4 mr-2 text-blue-500" />
                        Used vs Unused Questions
                      </h3>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={usedVsUnusedData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {usedVsUnusedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                              <Label
                                value={`${getPercentage(testDetail?.totalQuestions - testDetail?.incorrectAnswers, testDetail?.totalQuestions)}%`}
                                position="center"
                                className="text-2xl font-bold"
                                fill="#333"
                              />
                            </Pie>
                            <Tooltip 
                              formatter={(value) => [`${safeNumber(value)} Questions`, '']}
                              labelFormatter={() => ''}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center space-x-6">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-xs text-gray-600">Used</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                            <span className="text-xs text-gray-600">Unused</span>
                          </div>
                        </div>
                      </div>
                    </AnimatedDiv>

                    <div className="grid grid-cols-3 gap-3">
                      <AnimatedDiv
                        delay={1}
                        className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-3 shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center"
                      >
                        <div className="text-purple-500 mb-1">
                          <Database className="h-6 w-6" />
                        </div>
                        <div className="text-xs text-gray-600">Total</div>
                        <div className="text-lg font-bold mt-1 text-purple-700">{safeNumber(testDetail?.totalQuestions).toLocaleString()}</div>
                      </AnimatedDiv>

                      <AnimatedDiv
                        delay={1}
                        className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-3 shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center"
                      >
                        <div className="text-blue-500 mb-1">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="text-xs text-gray-600">Used</div>
                        <div className="text-lg font-bold mt-1 text-blue-700">{safeNumber(testDetail?.totalQuestions - testDetail?.incorrectAnswers).toLocaleString()}</div>
                      </AnimatedDiv>

                      <AnimatedDiv
                        delay={1}
                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-3 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center"
                      >
                        <div className="text-gray-500 mb-1">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="text-xs text-gray-600">Unused</div>
                        <div className="text-lg font-bold mt-1 text-gray-700">{safeNumber(testDetail?.incorrectAnswers).toLocaleString()}</div>
                      </AnimatedDiv>
                    </div>
                  </div>
                </div>
              </AnimatedDiv>
              
              <div className="space-y-8">
                {(() => {
                  if (!testDetail?.questions) return null;
                  
                  const groupedQuestions = testDetail.questions.reduce((acc, question) => {
                    const category = question.category;
                    if (!acc[category]) {
                      acc[category] = [];
                    }
                    acc[category].push({
                      id: question._id,
                      text: question.questionText,
                      difficulty: question.difficulty,
                    });
                    return acc;
                  }, {});

                  return Object.entries(groupedQuestions).map(([category, questions]) => (
                    <DataTable 
                      key={category}
                      data={questions} 
                      title={category} 
                      icon={Microscope} 
                      colorScheme="green" 
                    />
                  ));
                })()}
                
                {/* Subject Performance Stacked Horizontal Bar Chart */}
                {subjectPerformanceBarData.length > 0 && (
                  <AnimatedDiv delay={1} className="mt-8">
                    <Card className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                          Subject Performance Overview like this 
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-96">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart
                              layout="horizontal"
                              data={subjectPerformanceBarData}
                              margin={{
                                top: 20,
                                right: 150,
                                left: 60,
                                bottom: 20,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis 
                                type="number"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                domain={[0, 3000]}
                                tickFormatter={(value) => `${value}`}
                              />
                              <YAxis 
                                type="category"
                                dataKey="subject"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                width={50}
                              />
                              <Tooltip content={<CustomBarTooltip />} />
                              <Legend 
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="rect"
                                layout="vertical"
                                align="right"
                                verticalAlign="middle"
                              />
                              <Bar 
                                dataKey="direct" 
                                stackId="a"
                                fill="#4472C4" 
                                name="Direct"
                              />
                              <Bar 
                                dataKey="Jainid" 
                                stackId="a"
                                fill="#70AD47" 
                                name="Mail Ad"
                              />
                              <Bar 
                                dataKey="affiliateAd" 
                                stackId="a"
                                fill="#FFC000" 
                                name="Affiliate Ad"
                              />
                              <Bar 
                                dataKey="videoAd" 
                                stackId="a"
                                fill="#FF6B6B" 
                                name="Video Ad"
                              />
                              <Bar 
                                dataKey="searchEngine" 
                                stackId="a"
                                fill="#5B9BD5" 
                                name="Search Engine"
                              />
                            </RechartsBarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedDiv>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </TooltipProvider>
  );
};

export default OverallPerformanceView;