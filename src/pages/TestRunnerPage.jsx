import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { Menu, Clock, Flag, Check, ChevronLeft, ChevronRight, X, PlayCircle, PauseCircle, MessageSquare, Calculator as CalculatorIcon, Beaker, Sun, Moon } from 'lucide-react';
import MediaDisplay from './MediaDisplay';
import Calculator from './Calculator';

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [children]);

  if (hasError) {
    return <p className="text-red-500 dark:text-red-400">Error loading media. Please try again.</p>;
  }

  return (
    <React.Fragment>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          onError: () => setHasError(true),
        })
      )}
    </React.Fragment>
  );
};

const TestRunnerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  // State variables
  const [questions, setQuestions] = useState([]);
  const [testSessionId, setTestSessionId] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(90);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [submittedQuestions, setSubmittedQuestions] = useState([]);
  const [submissionResults, setSubmissionResults] = useState({});
  const [showUnansweredModal, setShowUnansweredModal] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [struckOptions, setStruckOptions] = useState({});
  const [highlights, setHighlights] = useState({});
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [activeFeature, setActiveFeature] = useState('none');
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [explanationPosition, setExplanationPosition] = useState('side');
  const highlightMenuRef = useRef(null);

  // Highlight color maps for light and dark modes
  const lightHighlightColors = {
    yellow: '#fef9c3',
    green: '#d1fae5',
    pink: '#fce7f3',
    blue: '#dbeafe',
  };

  const darkHighlightColors = {
  yellow: '#b59f3b', // Muted gold (better contrast with white text)
  green: '#228B22',  // Forest green
  pink: '#C71585',   // Medium violet pink
  blue: '#1E90FF',   // Dodger blue (still bright but more readable)
};

  // Retrieve test data
  const testData = location.state || JSON.parse(sessionStorage.getItem('testData')) || {};
  const usePerQuestionTimer = testData.testDuration && parseInt(testData.testDuration) === 90;

  // Load struck options and highlights from sessionStorage
  useEffect(() => {
    const savedStruck = JSON.parse(sessionStorage.getItem(`struckOptions_${testSessionId}`)) || {};
    setStruckOptions(savedStruck);
    const savedHighlights = JSON.parse(sessionStorage.getItem(`highlights_${testSessionId}`)) || {};
    setHighlights(savedHighlights);
  }, [testSessionId]);

  // Save struck options and highlights to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(`struckOptions_${testSessionId}`, JSON.stringify(struckOptions));
    sessionStorage.setItem(`highlights_${testSessionId}`, JSON.stringify(highlights));
  }, [struckOptions, highlights, testSessionId]);

  // Check for token
  useEffect(() => {
    if (!token) {
      alert('Authentication token is missing. Please log in again.');
      navigate('/login');
    }
  }, [token, navigate]);

  // Initialize test
  useEffect(() => {
    const initializeTest = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { testSessionId, questions, selectedFilters } = testData;
        if (!testSessionId || !questions || questions.length === 0) {
          throw new Error('Missing test data. Please start a new test from the filter page.');
        }

        if (!questions.every(q => q._id)) {
          throw new Error('Invalid question data: Each question must have an _id.');
        }

        setTestSessionId(testSessionId);
        setQuestions(questions);
        setSelectedFilters(selectedFilters || {});
        setUserAnswers(questions.map(q => ({ questionId: q._id, selectedAnswer: null })));
        setQuestionStartTime(Date.now());
        if (usePerQuestionTimer) {
          setTimeLeft(90);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error initializing test:', err);
        setError('Failed to load test session. Please start a new test.');
        setLoading(false);
      }
    };

    initializeTest();
  }, [testData, token]);

  // Timer effect
  useEffect(() => {
    if (!usePerQuestionTimer || timerPaused || !timeLeft || loading || error || testCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, error, testCompleted, timerPaused, currentQuestionIndex, usePerQuestionTimer]);

  // Reset timer on question change
  useEffect(() => {
    if (usePerQuestionTimer && !testCompleted) {
      setTimeLeft(90);
      setTimerPaused(false);
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, usePerQuestionTimer]);

  // Handle click outside highlight menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (highlightMenuRef.current && !highlightMenuRef.current.contains(e.target)) {
        setShowHighlightMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  // Auto-submit on timer expiry
  const handleAutoSubmit = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    await handleSubmitQuestion(-1);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleEndTest();
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle timer pause
  const toggleTimerPause = () => {
    setTimerPaused(prev => !prev);
  };

  // Handle answer selection
  const handleAnswerSelect = (answerIndex) => {
    setUserAnswers(prev => {
      const updated = [...prev];
      const questionIndex = updated.findIndex(a => a.questionId === questions[currentQuestionIndex]._id);
      updated[questionIndex].selectedAnswer = answerIndex;
      return updated;
    });
  };

  // Navigate questions
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  // Flag question
  const toggleFlagQuestion = (questionId) => {
    setFlaggedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });

    setUserAnswers(prev => {
      const updated = [...prev];
      const questionIndex = updated.findIndex(a => a.questionId === questionId);
      if (questionIndex !== -1) {
        updated[questionIndex].selectedAnswer = prev.includes(questionId) ? null : -1;
      }
      return updated;
    });
  };

  // Calculate time taken
  const calculateTimeTaken = () => {
    return Math.floor((Date.now() - questionStartTime) / 1000);
  };

  // Submit question
  const handleSubmitQuestion = async (autoSelectedAnswer = null) => {
    const currentQuestion = questions[currentQuestionIndex];
    const questionId = currentQuestion._id;
    if (!testSessionId || !questionId) {
      alert('Error: Test session or question ID is missing.');
      return;
    }

    const userAnswer = userAnswers.find(a => a.questionId === questionId);
    const selectedAnswer = autoSelectedAnswer !== null ? autoSelectedAnswer : (userAnswer?.selectedAnswer ?? -1);
    const timeTaken = calculateTimeTaken();

    const subjects = currentQuestion.subjects?.map(s => s.name) || [];
    const topics = currentQuestion.subjects?.flatMap(s => s.topics || []) || [];

    const payload = {
      testSessionId,
      questionId,
      selectedAnswer,
      subjects: subjects.length > 0 ? subjects : ['Unknown'],
      topics: topics.length > 0 ? topics : [],
      timeTaken,
    };

    setSubmitting(true);
    try {
      const submitResponse = await axios.post('/api/student-questions/submit', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (submitResponse.data.success) {
        setSubmittedQuestions(prev => {
          if (!prev.includes(questionId)) {
            return [...prev, questionId];
          }
          return prev;
        });

        const questionResponse = await axios.get(`/api/questions/${questionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (questionResponse.data.success) {
          const questionData = questionResponse.data.data;
          setQuestions(prev => {
            const updated = [...prev];
            updated[currentQuestionIndex] = {
              ...currentQuestion,
              explanation: questionData.explanation || 'No explanation available.',
              explanationMedia: questionData.explanationMedia || [],
              questionMedia: questionData.questionMedia || [],
              options: questionData.options || currentQuestion.options,
              correctAnswer: questionData.correctAnswer ?? currentQuestion.correctAnswer,
              subjects: questionData.subjects || currentQuestion.subjects,
            };
            return updated;
          });

          setSubmissionResults(prev => ({
            ...prev,
            [questionId]: {
              isCorrect: submitResponse.data.data.isCorrect,
              selectedAnswer,
              correctAnswer: questionData.correctAnswer ?? currentQuestion.correctAnswer,
              options: questionData.options || currentQuestion.options,
            },
          }));
        } else {
          throw new Error(questionResponse.data.message || 'Failed to fetch question details.');
        }
      } else {
        throw new Error(submitResponse.data.message || 'Submission failed.');
      }
    } catch (err) {
      console.error('Error submitting question:', err);
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again.');
        navigate('/login');
      } else {
        alert(`Submission failed: ${err.response?.data?.message || err.message || 'Please try again.'}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Submit unanswered questions
  const submitUnansweredQuestions = async () => {
    const unsubmittedQuestions = questions.filter(q => !submittedQuestions.includes(q._id));
    if (unsubmittedQuestions.length === 0) {
      await finalizeTest();
      return;
    }

    setSubmitting(true);
    try {
      const submissionPromises = unsubmittedQuestions.map(async (question) => {
        const payload = {
          testSessionId,
          questionId: question._id,
          selectedAnswer: -1,
          timeTaken: 0,
        };

        const submitResponse = await axios.post('/api/student-questions/submit', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (submitResponse.data.success) {
          setSubmittedQuestions(prev => [...prev, question._id]);

          const questionResponse = await axios.get(`/api/questions/${question._id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (questionResponse.data.success) {
            const questionData = questionResponse.data.data;
            setQuestions(prev => {
              const index = prev.findIndex(q => q._id === question._id);
              if (index !== -1) {
                prev[index] = {
                  ...prev[index],
                  explanation: questionData.explanation || 'No explanation available.',
                  explanationMedia: questionData.explanationMedia || [],
                  questionMedia: questionData.questionMedia || [],
                  options: questionData.options || prev[index].options,
                  correctAnswer: questionData.correctAnswer ?? prev[index].correctAnswer,
                };
              }
              return [...prev];
            });

            setSubmissionResults(prev => ({
              ...prev,
              [question._id]: {
                isCorrect: submitResponse.data.data.isCorrect,
                selectedAnswer: -1,
                correctAnswer: questionData.correctAnswer ?? question.correctAnswer,
                options: questionData.options || question.options,
              },
            }));
          } else {
            throw new Error(questionResponse.data.message || 'Failed to fetch question details.');
          }
        } else {
          throw new Error(`Failed to submit question ${question._id}: ${submitResponse.data.message}`);
        }
      });

      await Promise.all(submissionPromises);
      await finalizeTest();
    } catch (err) {
      console.error('Error submitting unanswered questions:', err);
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again.');
        navigate('/login');
      } else {
        setError(`Failed to submit some answers: ${err.message || 'Please try again.'}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Finalize test
  const finalizeTest = async () => {
    try {
      setLoading(true);

      let testSession;
      try {
        const sessionResponse = await axios.get(`/api/tests/${testSessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        testSession = sessionResponse.data.data;
      } catch (err) {
        if (err.response?.status === 401) {
          alert('Session expired. Please log in again.');
          navigate('/login');
          return;
        }
        if (err.response?.status === 404) {
          console.error(`Test session ${testSessionId} not found in database.`);
          setError('Test session not found. Please start a new test.');
          setTestCompleted(true);
          sessionStorage.removeItem('testData');
          return;
        }
        throw err;
      }

      if (['succeeded', 'canceled'].includes(testSession.status)) {
        setError('This test has already been completed or canceled.');
        setTestCompleted(true);
        sessionStorage.removeItem('testData');
        navigate(`/dashboard/test-detail/${testSessionId}`);
        return;
      }

      await axios.put(
        `/api/tests/${testSessionId}`,
        { status: 'succeeded' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const resultsResponse = await axios.get(`/api/student-questions/test/${testSessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const studentQuestions = resultsResponse.data.data || [];

      const resultsData = {
        score: studentQuestions.filter(q => q.isCorrect).length,
        totalQuestions: questions.length,
        answers: studentQuestions.map(q => ({
          question: q.question._id || q.question,
          selectedAnswer: q.selectedAnswer,
          isCorrect: q.isCorrect,
          correctAnswer: q.correctAnswer,
          timeTaken: q.timeTaken || 0,
          explanation: q.explanation,
          explanationMedia: q.explanationMedia,
          options: q.options,
        })),
        questions,
        flaggedQuestions,
      };

      setTestCompleted(true);
      sessionStorage.removeItem('testData');
      navigate(`/dashboard/test-detail/${testSessionId}`, { state: resultsData });
    } catch (err) {
      console.error('Error finalizing test:', err);
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again.');
        navigate('/login');
      } else {
        setError(`Failed to finalize test: ${err.response?.data?.message || err.message || 'Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // End test
  const handleEndTest = () => {
    const unansweredExists = userAnswers.some(a => a.selectedAnswer === null && !submittedQuestions.includes(a.questionId));
    if (unansweredExists) {
      setShowUnansweredModal(true);
    } else {
      submitUnansweredQuestions();
    }
  };

  // Direct submit
  const handleDirectSubmit = async () => {
    setShowUnansweredModal(false);
    await finalizeTest();
  };

  // Submit with defaults
  const handleSubmitWithDefaults = async () => {
    setShowUnansweredModal(false);
    await submitUnansweredQuestions();
  };

  // Back to dashboard
  const handleBackToDashboard = () => {
    if (confirm('Are you sure you want to leave?')) {
      sessionStorage.removeItem('testData');
      navigate('/dashboard');
    }
  };

  // Toggle strike-through on option
  const toggleStrikeThrough = (questionId, optionIndex) => {
    setStruckOptions(prev => {
      const key = `${questionId}_${optionIndex}`;
      const updated = { ...prev, [key]: !prev[key] };
      return updated;
    });
  };

  // Handle text selection and show highlight menu
  const handleTextSelection = (e) => {
    const selection = window.getSelection();
    if (selection.toString().trim() !== '') {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(selection.toString());
      setHighlightPosition({ x: rect.left + window.scrollX, y: rect.bottom + window.scrollY + 10 });
      setShowHighlightMenu(true);
    } else {
      setShowHighlightMenu(false);
    }
  };

  // Apply highlight
  const applyHighlight = (color) => {
    const questionId = currentQuestion._id;
    const key = `${questionId}_${Date.now()}`;
    setHighlights(prev => ({
      ...prev,
      [key]: { text: selectedText, color, questionId }, // Store color name
    }));
    setShowHighlightMenu(false);
    window.getSelection().removeAllRanges();
  };

  // Remove highlight
  const removeHighlight = (highlightKey) => {
    setHighlights(prev => {
      const updated = { ...prev };
      delete updated[highlightKey];
      return updated;
    });
  };

  // Render explanation with bullet points
  const renderExplanation = (explanation, questionId) => {
    if (!explanation || explanation === 'No explanation available.') {
      return <p className="text-gray-700 dark:text-gray-200 text-base">{renderHighlightedText(explanation, questionId)}</p>;
    }

    const segments = explanation
      .split('.')
      .map(segment => segment.trim())
      .filter(segment => segment.length > 0);

    if (segments.length <= 1) {
      return <p className="text-gray-700 dark:text-gray-200 text-base">{renderHighlightedText(explanation, questionId)}</p>;
    }

    return (
      <ul className="list-disc pl-5 space-y-2">
        {segments.map((segment, index) => (
          <li key={index} className="text-gray-700 dark:text-gray-200 text-base">
            {renderHighlightedText(segment, questionId)}
          </li>
        ))}
      </ul>
    );
  };

const renderHighlightedText = (text, questionId) => {
  if (!text) return null;

  const highlightsForQuestion = Object.entries(highlights).filter(
    ([, value]) => value.questionId === questionId && text.includes(value.text)
  );

  if (highlightsForQuestion.length === 0) return <>{text}</>;

  // Track replacements as spans
  const fragments = [];
  let remainingText = text;

  highlightsForQuestion.forEach(([key, { text: highlightText, color: colorName }]) => {
    const actualColor = isDarkMode ? darkHighlightColors[colorName] : lightHighlightColors[colorName];

    const index = remainingText.indexOf(highlightText);
    if (index !== -1) {
      // Push text before match
      if (index > 0) {
        fragments.push(remainingText.slice(0, index));
      }

      // Push highlighted span
      fragments.push(
        <span
          key={key}
          data-key={key}
          className="highlight text-gray-700 dark:text-gray-200"
          style={{ backgroundColor: actualColor }}
        >
          {highlightText}
        </span>
      );

      // Slice remaining text
      remainingText = remainingText.slice(index + highlightText.length);
    }
  });

  // Push any text left after the last match
  if (remainingText) {
    fragments.push(remainingText);
  }

  return <>{fragments}</>;
};


  // Loading state
  if (loading && !testCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 max-w-md mx-auto">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 dark:border-blue-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Loading your test...</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Please wait while we prepare your questions.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <svg className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Error</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <button onClick={handleBackToDashboard} className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = userAnswers.filter(a => a.selectedAnswer !== null && a.selectedAnswer !== -1).length;
  const isQuestionSubmitted = submittedQuestions.includes(currentQuestion?._id);
  const isQuestionFlagged = flaggedQuestions.includes(currentQuestion?._id);
  const submissionResult = submissionResults[currentQuestion?._id];

  // Determine if sidebar is needed
  const isSidebarNeeded = activeFeature !== 'none' || (explanationPosition === 'side' && isQuestionSubmitted);

  // Main test interface
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-[7.5%] bg-white dark:bg-gray-800 shadow-lg transform transition-transform ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } z-20 overflow-y-auto`}
      >
        <div className="flex justify-between items-center p-2 border-b dark:border-gray-700">
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Questions</h2>
          <button onClick={toggleSidebar} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <X size={16} />
          </button>
        </div>
        <div className="p-2">
          {questions.map((q, index) => {
            const isAnswered = userAnswers.find(a => a.questionId === q._id)?.selectedAnswer !== null;
            const isSubmitted = submittedQuestions.includes(q._id);
            const isFlagged = flaggedQuestions.includes(q._id);
            const isCurrent = index === currentQuestionIndex;
            const result = submissionResults[q._id];
            let bgColor = 'bg-gray-200 dark:bg-gray-700';
            let textColor = 'text-gray-700 dark:text-gray-200';
            let statusText = 'Not Answered';
            if (isCurrent) {
              bgColor = 'bg-blue-500 dark:bg-blue-600';
              textColor = 'text-white';
              statusText = 'Current';
            } else if (isSubmitted && result) {
              if (result.isCorrect) {
                bgColor = 'bg-green-500 dark:bg-green-600';
                textColor = 'text-white';
                statusText = 'Correct';
              } else if (result.selectedAnswer === -1) {
                bgColor = 'bg-yellow-200 dark:bg-yellow-700';
                textColor = 'text-gray-700 dark:text-gray-200';
                statusText = 'Flagged';
              } else {
                bgColor = 'bg-red-500 dark:bg-red-600';
                textColor = 'text-white';
                statusText = 'Incorrect';
              }
            } else if (isFlagged) {
              bgColor = 'bg-yellow-200 dark:bg-yellow-700';
              textColor = 'text-gray-700 dark:text-gray-200';
              statusText = 'Flagged';
            } else if (isAnswered) {
              bgColor = 'bg-blue-200 dark:bg-blue-700';
              textColor = 'text-gray-700 dark:text-gray-200';
              statusText = 'Answered';
            }

            return (
              <div key={q._id} className="mb-2">
                <button
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                    toggleSidebar();
                  }}
                  className={`w-full py-1 text-sm rounded ${bgColor} ${textColor} flex items-center justify-between px-2 relative`}
                  title={statusText}
                >
                  <span>{index + 1}</span>
                  {isFlagged && <Flag size={12} className="text-yellow-500 dark:text-yellow-400" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unanswered Modal */}
      {showUnansweredModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">You have unanswered questions</h2>
            <p className="mb-6 text-gray-500 dark:text-gray-400">Some questions are not yet answered. What would you like to do?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowUnansweredModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Go Back to Test
              </button>
              <button
                onClick={handleDirectSubmit}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                Submit As Is
              </button>
              <button
                onClick={handleSubmitWithDefaults}
                className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded hover:bg-green-700 dark:hover:bg-green-600"
              >
                Submit All Unanswered
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Highlight Menu */}
      {showHighlightMenu && (
        <div
          ref={highlightMenuRef}
          className="fixed bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-lg p-2 z-40"
          style={{ top: highlightPosition.y, left: highlightPosition.x }}
        >
          <div className="flex space-x-2">
            <button
              onClick={() => applyHighlight('yellow')}
              className="w-6 h-6 bg-yellow-200 dark:bg-yellow-500 rounded"
              title="Highlight Yellow"
            />
            <button
              onClick={() => applyHighlight('green')}
              className="w-6 h-6 bg-green-200 dark:bg-green-500 rounded"
              title="Highlight Green"
            />
            <button
              onClick={() => applyHighlight('pink')}
              className="w-6 h-6 bg-pink-200 dark:bg-pink-500 rounded"
              title="Highlight Pink"
            />
            <button
              onClick={() => applyHighlight('blue')}
              className="w-6 h-6 bg-blue-200 dark:bg-blue-500 rounded"
              title="Highlight Blue"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-grow flex">
        {/* Question Area */}
        <div className={`py-8 px-4 ${isSidebarNeeded ? 'w-3/5' : 'w-full'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-600 dark:bg-blue-500 p-4 flex justify-between items-center text-white">
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="mr-4 hover:bg-blue-700 dark:hover:bg-blue-600 p-1 rounded-full"
                  aria-label="Open question navigator"
                >
                  <Menu size={20} />
                </button>
                <h1 className="text-xl font-bold">Test Session</h1>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleFlagQuestion(currentQuestion?._id)}
                  className={`hover:bg-blue-700 dark:hover:bg-blue-600 p-1 rounded-full ${isQuestionFlagged ? 'text-yellow-400' : 'text-white'}`}
                  aria-label="Flag question"
                >
                  <Flag size={20} />
                </button>
                <button
                  onClick={() => setActiveFeature(activeFeature === 'chat' ? 'none' : 'chat')}
                  className={`hover:bg-blue-700 dark:hover:bg-blue-600 p-1 rounded-full ${activeFeature === 'chat' ? 'text-yellow-400' : 'text-white'}`}
                  aria-label="Chat"
                >
                  <MessageSquare size={20} />
                </button>
                <button
                  onClick={() => setActiveFeature(activeFeature === 'calculator' ? 'none' : 'calculator')}
                  className={`hover:bg-blue-700 dark:hover:bg-blue-600 p-1 rounded-full ${activeFeature === 'calculator' ? 'text-yellow-400' : 'text-white'}`}
                  aria-label="Calculator"
                >
                  <CalculatorIcon size={20} />
                </button>
                <button
                  onClick={() => setActiveFeature(activeFeature === 'lab' ? 'none' : 'lab')}
                  className={`hover:bg-blue-700 dark:hover:bg-blue-600 p-1 rounded-full ${activeFeature === 'lab' ? 'text-yellow-400' : 'text-white'}`}
                  aria-label="Lab"
                >
                  <Beaker size={20} />
                </button>
                <button
                  onClick={toggleDarkMode}
                  className="hover:bg-blue-700 dark:hover:bg-blue-600 p-1 rounded-full"
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                {usePerQuestionTimer && (
                  <div className="flex items-center">
                    <button
                      onClick={toggleTimerPause}
                      className="hover:bg-blue-700 dark:hover:bg-blue-600 p-1 rounded-full mr-2"
                      aria-label={timerPaused ? 'Resume timer' : 'Pause timer'}
                    >
                      {timerPaused ? <PlayCircle size={20} /> : <PauseCircle size={20} />}
                    </button>
                    <div className="flex items-center space-x-1">
                      <Clock size={16} />
                      <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b dark:border-gray-600">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 dark:text-gray-200">Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span className="text-gray-700 dark:text-gray-200">{answeredCount} of {questions.length} answered</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="p-6" onMouseUp={handleTextSelection}>
              <div className="mb-8">
                <div className="flex justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {currentQuestion?.questionText
                      ? renderHighlightedText(
                          typeof currentQuestion.questionText === 'object'
                            ? currentQuestion.questionText.text
                            : currentQuestion.questionText,
                          currentQuestion._id
                        )
                      : 'No question text'}
                  </h2>
                </div>
                {isQuestionSubmitted && currentQuestion?.questionMedia?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {currentQuestion.questionMedia.map((media, index) => (
                      <ErrorBoundary key={index}>
                        <MediaDisplay media={media} label={`Question Media ${index + 1}`} />
                      </ErrorBoundary>
                    ))}
                  </div>
                )}

                <div className="space-y-4">
                  {(currentQuestion?.options || []).map((option, index) => {
                    const isSelected = userAnswers.find(a => a.questionId === currentQuestion._id)?.selectedAnswer === index;
                    const isStruck = struckOptions[`${currentQuestion._id}_${index}`];
                    const isCorrect = isQuestionSubmitted && index === submissionResult?.correctAnswer;
                    const isSelectedIncorrect = isQuestionSubmitted && index === submissionResult?.selectedAnswer && !submissionResult?.isCorrect;

                    return (
                      <div
                        key={index}
                        className={`flex items-center p-4 border rounded-lg ${
                          isQuestionSubmitted && isCorrect ? 'bg-green-100 dark:bg-green-900' : ''
                        } ${
                          isQuestionSubmitted && isSelectedIncorrect ? 'bg-red-100 dark:bg-red-900' : ''
                        }`}
                      >
                        <button
                          onClick={() => !isQuestionSubmitted && handleAnswerSelect(index)}
                          className={`flex-shrink-0 w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                            isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                          } ${isQuestionSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          disabled={isQuestionSubmitted}
                          aria-label={`Select option ${String.fromCharCode(65 + index)}`}
                        >
                          {String.fromCharCode(65 + index)}
                        </button>
                        <div className="flex flex-col">
                          <span
                            style={{ textDecoration: isStruck ? 'line-through' : 'none' }}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              toggleStrikeThrough(currentQuestion._id, index);
                            }}
                            onClick={(e) => {
                              if (e.button === 0) {
                                toggleStrikeThrough(currentQuestion._id, index);
                              }
                            }}
                            className="text-gray-700 dark:text-gray-200"
                          >
                            {option?.text
                              ? renderHighlightedText(
                                  typeof option === 'object' ? option.text : option,
                                  currentQuestion._id
                                )
                              : 'No option text'}
                          </span>
                          {isQuestionSubmitted && option?.media?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {option.media.map((media, mediaIndex) => (
                                <ErrorBoundary key={mediaIndex}>
                                  <MediaDisplay media={media} label={`Option ${String.fromCharCode(65 + index)} Media ${mediaIndex + 1}`} />
                                </ErrorBoundary>
                              ))}
                            </div>
                          )}
                        </div>
                        {isQuestionSubmitted && (
                          <span className="ml-2">
                            {isCorrect && <Check size={16} className="text-green-500 dark:text-green-400" />}
                            {isSelectedIncorrect && <X size={16} className="text-red-500 dark:text-red-400" />}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {isQuestionSubmitted && explanationPosition === 'bottom' && (
                <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg" onMouseUp={handleTextSelection}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Feedback and Explanation</h3>
                    <button
                      onClick={() => setExplanationPosition('side')}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Move to side
                    </button>
                  </div>
                  {submissionResult && (
                    <p className={`mb-4 text-sm font-medium ${submissionResult.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Your answer is {submissionResult.isCorrect ? 'correct' : 'incorrect'}.
                      {submissionResult.selectedAnswer !== -1 && (
                        <>
                          {' You selected: '}
                          {submissionResult.options[submissionResult.selectedAnswer]?.text || 'None'}
                          {'. Correct answer: '}
                          {submissionResult.options[submissionResult.correctAnswer]?.text || 'Unknown'}
                        </>
                      )}
                    </p>
                  )}
                  <div className="mb-4">
                    <h4 className="text-md font-medium mb-2 text-gray-900 dark:text-gray-100">Explanation</h4>
                    {renderExplanation(currentQuestion?.explanation, currentQuestion?._id)}
                  </div>
                  {isQuestionSubmitted && currentQuestion?.explanationMedia?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {currentQuestion.explanationMedia.map((media, index) => (
                        <ErrorBoundary key={index}>
                          <MediaDisplay media={media} label={`Explanation Media ${index + 1}`} />
                        </ErrorBoundary>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between mt-8">
                <div className="flex space-x-4">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`px-4 py-2 rounded flex items-center ${
                      currentQuestionIndex === 0
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ChevronLeft size={16} className="mr-1" /> Previous
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className={`px-4 py-2 rounded flex items-center ${
                      currentQuestionIndex === questions.length - 1
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    Next <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleSubmitQuestion()}
                    disabled={isQuestionSubmitted || submitting}
                    className={`px-6 py-2 rounded flex items-center ${
                      isQuestionSubmitted || submitting
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                    }`}
                  >
                    <Check size={16} className="mr-2" />
                    {submitting ? 'Submitting...' : isQuestionSubmitted ? 'Submitted' : 'Submit Question'}
                  </button>
                </div>
              </div>

              <div className="mt-12 pt-6 border-t dark:border-gray-700 flex justify-between">
                <button
                  onClick={handleBackToDashboard}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel Test
                </button>
                <button
                  onClick={handleEndTest}
                  className="px-6 py-2 bg-red-600 dark:bg-red-500 text-white rounded hover:bg-red-700 dark:hover:bg-red-600"
                >
                  End Test
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar for Features */}
        {isSidebarNeeded && (
          <div className="w-2/5 py-8 pl-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              {explanationPosition === 'side' && isQuestionSubmitted ? (
                <div onMouseUp={handleTextSelection}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Feedback and Explanation</h3>
                    <button
                      onClick={() => setExplanationPosition('bottom')}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Move to bottom
                    </button>
                  </div>
                  {submissionResult && (
                    <p className={`mb-4 text-sm font-medium ${submissionResult.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Your answer is {submissionResult.isCorrect ? 'correct' : 'incorrect'}.
                      {submissionResult.selectedAnswer !== -1 && (
                        <>
                          {' You selected: '}
                          {submissionResult.options[submissionResult.selectedAnswer]?.text || 'None'}
                          {'. Correct answer: '}
                          {submissionResult.options[submissionResult.correctAnswer]?.text || 'Unknown'}
                        </>
                      )}
                    </p>
                  )}
                  <div className="mb-4">
                    <h4 className="text-md font-medium mb-2 text-gray-900 dark:text-gray-100">Explanation</h4>
                    {renderExplanation(currentQuestion?.explanation, currentQuestion?._id)}
                  </div>
                  {isQuestionSubmitted && currentQuestion?.explanationMedia?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {currentQuestion.explanationMedia.map((media, index) => (
                        <ErrorBoundary key={index}>
                          <MediaDisplay media={media} label={`Explanation Media ${index + 1}`} />
                        </ErrorBoundary>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {activeFeature === 'calculator' ? (
                    <div className="relative">
                      <button
                        onClick={() => setActiveFeature('none')}
                        className="absolute top-2 right-2 text-gray-500 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-300"
                        aria-label="Close"
                      >
                        <X size={16} />
                      </button>
                      <Calculator onClose={() => setActiveFeature('none')} />
                    </div>
                  ) : activeFeature === 'lab' ? (
                    <div className="text-center p-4 relative">
                      <button
                        onClick={() => setActiveFeature('none')}
                        className="absolute top-2 right-2 text-gray-500 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-300"
                        aria-label="Close"
                      >
                        <X size={16} />
                      </button>
                      <p className="text-gray-700 dark:text-gray-200">Open Lab feature coming soon!</p>
                    </div>
                  ) : activeFeature === 'chat' ? (
                    <div className="text-center p-4 relative">
                      <button
                        onClick={() => setActiveFeature('none')}
                        className="absolute top-2 right-2 text-gray-500 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-300"
                        aria-label="Close"
                      >
                        <X size={16} />
                      </button>
                      <p className="text-gray-700 dark:text-gray-200">Chat feature coming soon!</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestRunnerPage;