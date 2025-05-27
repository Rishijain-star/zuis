import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Image as ImageIcon, ArrowLeft } from "lucide-react";
import MediaDisplay from "./MediaDisplay";
import { categories, subjectsByCategory, topicsBySubject } from "../data/questionData";

const AttemptedQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, limit: 10 });
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [questionDetails, setQuestionDetails] = useState({});
  const [questionStatusFilter, setQuestionStatusFilter] = useState("all");
  const [difficulty, setDifficulty] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [counts, setCounts] = useState({ all: 0, correct: 0, incorrect: 0 });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      let url = `https://synapaxon-backend.onrender.com/api/student-questions/history?page=${pagination.current}&limit=${pagination.limit}`;
      if (questionStatusFilter === "correct") url += "&isCorrect=true";
      if (questionStatusFilter === "incorrect") url += "&isCorrect=false&flagged=false";
      if (difficulty) url += `&difficulty=${difficulty}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      if (selectedSubject) url += `&subject=${selectedSubject}`;
      if (selectedTopic) url += `&topic=${selectedTopic}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch questions");
      const data = await response.json();
      setQuestions(data.data || []);
      setPagination({
        current: data.pagination?.current || 1,
        pages: data.pagination?.pages || 1,
        limit: data.pagination?.limit || 10,
      });
      setTotalQuestions(data.total || 0);

      const detailsPromises = data.data.map(async (q) => {
        try {
          const detailRes = await fetch(
            `https://synapaxon-backend.onrender.com/api/questions/${q.question?._id || q._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          return detailRes.ok
            ? { [q._id]: (await detailRes.json()).data }
            : { [q._id]: { explanation: "No explanation", questionMedia: [], explanationMedia: [], options: [] } };
        } catch {
          return { [q._id]: { explanation: "Error fetching", questionMedia: [], explanationMedia: [], options: [] } };
        }
      });
      setQuestionDetails((await Promise.all(detailsPromises)).reduce((acc, curr) => ({ ...acc, ...curr }), {}));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const allRes = await fetch(
        `https://synapaxon-backend.onrender.com/api/student-questions/history?${difficulty ? `difficulty=${difficulty}&` : ""}${
          selectedCategory ? `category=${selectedCategory}&` : ""
        }${selectedSubject ? `subject=${selectedSubject}&` : ""}${selectedTopic ? `topic=${selectedTopic}` : ""}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const correctRes = await fetch(
        `https://synapaxon-backend.onrender.com/api/student-questions/history?isCorrect=true${difficulty ? `&difficulty=${difficulty}` : ""}${
          selectedCategory ? `&category=${selectedCategory}` : ""
        }${selectedSubject ? `&subject=${selectedSubject}` : ""}${selectedTopic ? `&topic=${selectedTopic}` : ""}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const incorrectRes = await fetch(
        `https://synapaxon-backend.onrender.com/api/student-questions/history?isCorrect=false&flagged=false${
          difficulty ? `&difficulty=${difficulty}` : ""
        }${selectedCategory ? `&category=${selectedCategory}` : ""}${selectedSubject ? `&subject=${selectedSubject}` : ""}${
          selectedTopic ? `&topic=${selectedTopic}` : ""
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const allData = await allRes.json();
      const correctData = await correctRes.json();
      const incorrectData = await incorrectRes.json();
      setCounts({
        all: allData.total || 0,
        correct: correctData.total || 0,
        incorrect: incorrectData.total || 0,
      });
    } catch (err) {
      console.error("Error fetching counts:", err);
    }
  };

  useEffect(() => {
    fetchCounts();
    fetchQuestions();
  }, [questionStatusFilter, difficulty, selectedCategory, selectedSubject, selectedTopic, pagination.current]);

  const filteredQuestions = useMemo(() => questions, [questions]);

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, current: page }));
  };

  const toggleQuestion = (questionId) => {
    setExpandedQuestions((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(dateString));
  };

  const resetFilters = () => {
    setDifficulty("");
    setSelectedCategory("");
    setSelectedSubject("");
    setSelectedTopic("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">My Attempted Questions</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-600 p-6 text-white flex justify-between items-center">
            <h2 className="text-2xl font-bold">Filter Questions</h2>
            <div className="text-base font-semibold">
              Total Questions: <span className="bg-white text-indigo-600 px-3 py-1 rounded-full">{totalQuestions}</span>
            </div>
          </div>

          <div className="p-6">
            <div className="flex gap-4 mb-6">
              {[
                { value: "all", label: `All (Q${counts.all})` },
                { value: "correct", label: `Correct (Q${counts.correct})` },
                { value: "incorrect", label: `Incorrect (Q${counts.incorrect})` },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => {
                    setQuestionStatusFilter(filter.value);
                    setPagination((prev) => ({ ...prev, current: 1 }));
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    questionStatusFilter === filter.value
                      ? "bg-blue-500 text-white"
                      : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="mb-6">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200"
              >
                {filterOpen ? "Hide Filters" : "More Filters"}
                {filterOpen ? <ChevronUp className="ml-2" /> : <ChevronDown className="ml-2" />}
              </button>
              {filterOpen && (
                <div className="mt-4 bg-blue-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Difficulty</h3>
                      <select
                        value={difficulty}
                        onChange={(e) => {
                          setDifficulty(e.target.value);
                          setSelectedCategory("");
                          setSelectedSubject("");
                          setSelectedTopic("");
                          setPagination((prev) => ({ ...prev, current: 1 }));
                        }}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                      >
                        <option value="">Select Difficulty</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    {difficulty && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2">Category</h3>
                        <select
                          value={selectedCategory}
                          onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setSelectedSubject("");
                            setSelectedTopic("");
                            setPagination((prev) => ({ ...prev, current: 1 }));
                          }}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat.name} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {selectedCategory && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2">Subject</h3>
                        <select
                          value={selectedSubject}
                          onChange={(e) => {
                            setSelectedSubject(e.target.value);
                            setSelectedTopic("");
                            setPagination((prev) => ({ ...prev, current: 1 }));
                          }}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                          <option value="">Select Subject</option>
                          {(subjectsByCategory[selectedCategory] || []).map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {selectedSubject && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2">Topic</h3>
                        <select
                          value={selectedTopic}
                          onChange={(e) => {
                            setSelectedTopic(e.target.value);
                            setPagination((prev) => ({ ...prev, current: 1 }));
                          }}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                          <option value="">Select Topic</option>
                          {(topicsBySubject[selectedSubject] || []).map((topic) => (
                            <option key={topic} value={topic}>
                              {topic}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  {(difficulty || selectedCategory || selectedSubject || selectedTopic) && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Selected Filters</h4>
                      <div className="flex flex-wrap gap-2">
                        {difficulty && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            Difficulty: {difficulty}
                          </span>
                        )}
                        {selectedCategory && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            Category: {selectedCategory}
                          </span>
                        )}
                        {selectedSubject && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            Subject: {selectedSubject}
                          </span>
                        )}
                        {selectedTopic && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            Topic: {selectedTopic}
                          </span>
                        )}
                        <button
                          onClick={resetFilters}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 relative">
            {loading && (
              <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75 z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
              </div>
            )}
            {error && (
              <div className="p-6 bg-red-50 border border-red-300 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}
            {!error && filteredQuestions.length === 0 && !loading && (
              <div className="p-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <ImageIcon className="w-16 h-16 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No Questions Found</h3>
                  <p className="text-gray-600 text-lg mb-8">Adjust your filters or start a new test to attempt questions.</p>
                  <button
                    onClick={() => navigate("/dashboard/starttest")}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all text-lg font-semibold shadow-lg"
                  >
                    Start a New Test
                  </button>
                </div>
              </div>
            )}
            {!error && filteredQuestions.length > 0 && (
              <>
                {filteredQuestions.map((question, index) => (
                  <div
                    key={question._id}
                    className="mb-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all"
                  >
                    <button
                      onClick={() => toggleQuestion(question._id)}
                      className="w-full p-6 flex justify-between items-center text-left hover:bg-gray-50"
                    >
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Q{index + 1}: {questionDetails[question._id]?.questionText || question.question?.questionText || "Question not available"}
                        </h3>
                        {questionDetails[question._id]?.questionMedia?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {questionDetails[question._id].questionMedia.map((media, i) => (
                              <MediaDisplay key={i} media={media} label={`Question Media ${i + 1}`} />
                            ))}
                          </div>
                        )}
                      </div>
                      {expandedQuestions[question._id] ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                    </button>
                    {expandedQuestions[question._id] && (
                      <div className="p-6 border-t border-gray-200">
                        <div className="space-y-4 mb-6">
                          {questionDetails[question._id]?.options?.map((option, oIndex) => (
                            <div
                              key={oIndex}
                              className={`p-4 rounded-lg flex items-center space-x-4 ${
                                question.selectedAnswer === oIndex && question.isCorrect
                                  ? "bg-green-50 border border-green-200"
                                  : question.selectedAnswer === oIndex && !question.isCorrect
                                  ? "bg-red-50 border border-red-200"
                                  : questionDetails[question._id]?.correctAnswer === oIndex
                                  ? "bg-blue-50 border border-blue-200"
                                  : "bg-gray-50 border border-gray-200"
                              }`}
                            >
                              <div className="flex-shrink-0">
                                {question.selectedAnswer === oIndex ? (
                                  <svg
                                    className={`w-6 h-6 ${question.isCorrect ? "text-green-500" : "text-red-500"}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    {question.isCorrect ? (
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                      />
                                    ) : (
                                      <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                      />
                                    )}
                                  </svg>
                                ) : questionDetails[question._id]?.correctAnswer === oIndex ? (
                                  <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : (
                                  <div className="w-6 h-6"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-base text-gray-700">
                                  {String.fromCharCode(65 + oIndex)}. {option?.text || "Option not available"}
                                </p>
                                {option?.media?.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {option.media.map((media, i) => (
                                      <MediaDisplay
                                        key={i}
                                        media={media}
                                        label={`Option ${String.fromCharCode(65 + oIndex)} Media ${i + 1}`}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6">
                          <h4 className="text-base font-semibold text-gray-900 mb-2">Explanation</h4>
                          {(() => {
                            const explanation = questionDetails[question._id]?.explanation || "";
                            if (!explanation) return <p className="text-base text-gray-700">No explanation available</p>;
                            const segments = explanation.split(".").map((s) => s.trim()).filter((s) => s);
                            return segments.length <= 1 ? (
                              <p className="text-base text-gray-700">{explanation}</p>
                            ) : (
                              <ul className="list-disc pl-5 space-y-2 text-gray-700 text-base">
                                {segments.map((segment, i) => (
                                  <li key={i}>{segment}.</li>
                                ))}
                              </ul>
                            );
                          })()}
                          {questionDetails[question._id]?.explanationMedia?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {questionDetails[question._id].explanationMedia.map((media, i) => (
                                <MediaDisplay key={i} media={media} label={`Explanation Media ${i + 1}`} />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-4">
                          <span>Category: {question.category || "N/A"}</span>
                          <span className="mx-2">•</span>
                          <span>Subject: {question.subject || "N/A"}</span>
                          <span className="mx-2">•</span>
                          <span>Topic: {question.topic || "N/A"}</span>
                          <span className="mx-2">•</span>
                          <span>Difficulty: {question.difficulty || "N/A"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {pagination.pages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="inline-flex rounded-lg shadow-sm">
                      <button
                        onClick={() => handlePageChange(pagination.current - 1)}
                        disabled={pagination.current === 1}
                        className={`px-4 py-2 border text-base font-medium rounded-l-lg ${
                          pagination.current === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        Previous
                      </button>
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-5 py-2 border text-base font-medium ${
                            pagination.current === page
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(pagination.current + 1)}
                        disabled={pagination.current === pagination.pages}
                        className={`px-4 py-2 border text-base font-medium rounded-r-lg ${
                          pagination.current === pagination.pages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttemptedQuestionsPage;