import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Award,
  Clock,
  Target,
  BookOpen,
  BarChart3,
} from "lucide-react";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Title,
  Tooltip,
  Legend
);

const TestHistoryPage = () => {
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    limit: 10,
  });
  const [totalTests, setTotalTests] = useState(0);
  const [analytics, setAnalytics] = useState({
    averageScore: 0,
    completionRate: 0,
  });
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTestHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch(
          `https://synapaxon-backend.onrender.com/api/tests?page=${pagination.current}&limit=${pagination.limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch test history: ${response.statusText}`
          );
        }

        const responseData = await response.json();

        if (responseData.success) {
          setTestHistory(responseData.data);
          setPagination({
            current: responseData.pagination?.current || 1,
            pages: responseData.pagination?.pages || 1,
            limit: responseData.pagination?.limit || 10,
          });
          setTotalTests(responseData.total || 0);

          const completedTests = responseData.data.filter(
            (test) => test.status === "succeeded"
          ).length;
          const totalScorePercentage = responseData.data.reduce(
            (sum, test) => sum + (test.scorePercentage || 0),
            0
          );
          setAnalytics({
            averageScore:
              responseData.data.length > 0
                ? Math.round(totalScorePercentage / responseData.data.length)
                : 0,
            completionRate:
              responseData.data.length > 0
                ? Math.round((completedTests / responseData.data.length) * 100)
                : 0,
          });
        } else {
          throw new Error(
            responseData.message || "Failed to fetch test history"
          );
        }
      } catch (err) {
        console.error("Error fetching test history:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTestHistory();
  }, [pagination.current]);

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, current: page }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  const formatDuration = (startDate, endDate) => {
    if (!endDate) return "In Progress";
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end - start;
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const viewTestDetail = (testId) => {
    navigate(`/dashboard/test-detail/${testId}`);
  };

  // Empty state component for analytics
  const EmptyAnalytics = () => (
    <div className="p-6 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl border-2 border-dashed border-blue-200 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Average Score
          </h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">--</div>
          <p className="text-blue-600 text-sm">
            Complete your first test to see your average score
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-xl border-2 border-dashed border-green-200 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Completion Rate
          </h3>
          <div className="text-3xl font-bold text-green-600 mb-2">--</div>
          <p className="text-green-600 text-sm">
            Track how many tests you complete successfully
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-8 rounded-xl border-2 border-dashed border-purple-200 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            Progress Trends
          </h3>
          <div className="text-purple-600 mb-4">
            <TrendingUp className="w-12 h-12 mx-auto opacity-50" />
          </div>
          <p className="text-purple-600 text-sm">
            Your performance chart will appear here after taking tests
          </p>
        </div>
      </div>
    </div>
  );

  // Empty state component for test history
  const EmptyTestHistory = () => (
    <div className="p-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <BookOpen className="w-16 h-16 text-indigo-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">No Tests Yet</h3>
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          Ready to test your knowledge? Start your first practice test and track
          your progress over time.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => navigate("/dashboard/starttest")}
            className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Start Your First Test
          </button>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>Timed Practice</span>
            </div>
            <div className="flex items-center">
              <Target className="w-4 h-4 mr-2" />
              <span>Instant Results</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span>Progress Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 mb-4 mx-auto"></div>
          <div className="text-gray-600 text-lg font-medium">
            Loading your test history...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto mt-12 p-8 bg-red-50 border border-red-300 rounded-2xl shadow-lg">
        <div className="flex items-center">
          <svg
            className="w-8 h-8 text-red-600 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-red-800 text-lg font-semibold">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-600 p-8 text-white flex justify-between items-center">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Test History
            </h1>
            <div className="text-base font-semibold">
              Total Tests:{" "}
              <span className="bg-white text-indigo-600 px-3 py-1 rounded-full">
                {totalTests}
              </span>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
              className="w-full p-6 flex justify-between items-center text-left bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <h2 className="text-2xl font-semibold text-gray-900">
                Performance Analytics
              </h2>
              {isAnalyticsOpen ? (
                <ChevronUp className="w-6 h-6 text-gray-600" />
              ) : (
                <ChevronDown className="w-6 h-6 text-gray-600" />
              )}
            </button>
            {isAnalyticsOpen &&
              (testHistory.length === 0 ? (
                <EmptyAnalytics />
              ) : (
                <div className="p-6 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Average Score */}
                    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-600 text-sm">
                          Average Score
                        </span>
                        <Target className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="relative w-32 h-32">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                              className="text-gray-200"
                              strokeWidth="10"
                              stroke="currentColor"
                              fill="transparent"
                              r="45"
                              cx="50"
                              cy="50"
                            />
                            <circle
                              className={`text-indigo-600`}
                              strokeWidth="10"
                              strokeDasharray={`${
                                (analytics.averageScore / 100) * 283
                              } 283`}
                              strokeDashoffset="0"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="transparent"
                              r="45"
                              cx="50"
                              cy="50"
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold text-indigo-600">
                              {analytics.averageScore}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Completion Rate */}
                    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-600 text-sm">
                          Completion Rate
                        </span>
                        <Award className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>{analytics.completionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full bg-green-500"
                            style={{ width: `${analytics.completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Test History Table */}
          {testHistory.length === 0 ? (
            <EmptyTestHistory />
          ) : (
            <div className="p-8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Test Date
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-8 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {testHistory.map((test) => (
                      <tr
                        key={test._id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-8 py-5 whitespace-nowrap text-base text-gray-900">
                          {formatDate(test.startedAt)}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-sm font-semibold rounded-full ${
                              test.status === "succeeded"
                                ? "bg-green-100 text-green-800"
                                : test.status === "canceled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {test.status === "succeeded"
                              ? "Completed"
                              : test.status === "canceled"
                              ? "Canceled"
                              : "In Progress"}
                          </span>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="text-base font-medium text-gray-900">
                            {test.correctAnswers || 0}/{test.totalQuestions} (
                            {Math.round(test.scorePercentage || 0)}%)
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className={`h-2 rounded-full ${
                                test.scorePercentage >= 70
                                  ? "bg-green-500"
                                  : test.scorePercentage >= 40
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${test.scorePercentage || 0}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-base text-gray-900">
                          {formatDuration(test.startedAt, test.completedAt)}
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-right text-base font-medium">
                          <button
                            onClick={() => viewTestDetail(test._id)}
                            className="text-indigo-600 hover:text-indigo-800 transition-colors font-semibold"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.pages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="inline-flex rounded-lg shadow-sm">
                    {Array.from(
                      { length: pagination.pages },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-5 py-2 border text-base font-medium ${
                          pagination.current === page
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        } ${page === 1 ? "rounded-l-lg" : ""} ${
                          page === pagination.pages ? "rounded-r-lg" : ""
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestHistoryPage;
