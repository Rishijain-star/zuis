import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import axios from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { categories, subjectsByCategory, topicsBySubject } from "../data/questionData";

export default function QuestionFilterPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || "");
  const [selectedSubjects, setSelectedSubjects] = useState(new Set());
  const [selectedTopics, setSelectedTopics] = useState(new Map());
  const [categoryCounts, setCategoryCounts] = useState({});
  const [subjectCounts, setSubjectCounts] = useState({});
  const [topicCounts, setTopicCounts] = useState({});
  const [difficulty, setDifficulty] = useState("all");
  const [useTimer, setUseTimer] = useState(false);
  const [testDuration] = useState("90");
  const [numberOfItems, setNumberOfItems] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const [questionStatusFilter, setQuestionStatusFilter] = useState("all");
  const [totalQuestions, setTotalQuestions] = useState(0);
  const token = localStorage.getItem("token");

  // Reset subjects and topics when top-level filters change
  useEffect(() => {
    setSelectedSubjects(new Set());
    setSelectedTopics(new Map());
    setActiveSubject(null);
  }, [questionStatusFilter, difficulty, selectedCategory]);

  // Normalize StudentQuestion subjects to match Question schema
  const normalizeStudentQuestion = (sq) => ({
    ...sq.question,
    _id: sq.question._id,
    subjects: sq.subjects.map(name => ({ name, topics: sq.topics || [] })), // Transform [String] to [{ name, topics }]
    topics: undefined, // Remove top-level topics
  });

  // Fetch counts for categories, subjects, and topics
  const fetchCounts = async () => {
    const categoryCountMap = {};
    const subjectCountMap = {};
    const topicCountMap = {};

    try {
      // Initialize counts for all categories
      categories.forEach((cat) => {
        categoryCountMap[cat.name] = { all: 0, correct: 0, incorrect: 0, unattempted: 0, flagged: 0 };
      });

      // Build API query for history (without pagination)
      const historyQuery = `/api/student-questions/history?category=${selectedCategory}${
        difficulty !== "all" ? `&difficulty=${difficulty}` : ""
      }`;
      const historyRes = await axios.get(historyQuery, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const historyQuestions = (historyRes.data.data || []).map(normalizeStudentQuestion);

      // Build API query for all questions (without pagination)
      const questionsQuery = `/api/questions?category=${selectedCategory}&createdBy=me${
        difficulty !== "all" ? `&difficulty=${difficulty}` : ""
      }`;
      const allQuestionsRes = await axios.get(questionsQuery, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allQuestions = allQuestionsRes.data.data || [];

      // Compute status counts
      const correctIds = historyQuestions
        .filter((q) => q.isCorrect)
        .map((q) => q._id.toString());
      const incorrectIds = historyQuestions
        .filter((q) => !q.isCorrect && q.selectedAnswer !== -1)
        .map((q) => q._id.toString());
      const flaggedIds = historyQuestions
        .filter((q) => q.selectedAnswer === -1)
        .map((q) => q._id.toString());
      const allIds = allQuestions.map((q) => q._id.toString());
      const unattemptedIds = allIds.filter(
        (id) => !correctIds.includes(id) && !incorrectIds.includes(id) && !flaggedIds.includes(id)
      );

      categoryCountMap[selectedCategory] = {
        all: allQuestions.length,
        correct: correctIds.length,
        incorrect: incorrectIds.length,
        unattempted: unattemptedIds.length,
        flagged: flaggedIds.length,
      };

      // Derive subjects from questions
      const subjects = [...new Set(allQuestions.flatMap((q) => q.subjects.map(s => s.name)))].filter((s) =>
        (subjectsByCategory[selectedCategory] || []).includes(s)
      );

      subjects.forEach((subject) => {
        const subjectQuestions = allQuestions.filter((q) => q.subjects.some(s => s.name === subject));
        const subjectHistory = historyQuestions.filter((q) => q.subjects.some(s => s.name === subject));
        const subjectCorrectIds = subjectHistory
          .filter((q) => q.isCorrect)
          .map((q) => q._id.toString());
        const subjectIncorrectIds = subjectHistory
          .filter((q) => !q.isCorrect && q.selectedAnswer !== -1)
          .map((q) => q._id.toString());
        const subjectFlaggedIds = subjectHistory
          .filter((q) => q.selectedAnswer === -1)
          .map((q) => q._id.toString());
        const subjectAllIds = subjectQuestions.map((q) => q._id.toString());
        const subjectUnattemptedIds = subjectAllIds.filter(
          (id) =>
            !subjectCorrectIds.includes(id) &&
            !subjectIncorrectIds.includes(id) &&
            !subjectFlaggedIds.includes(id)
        );

        subjectCountMap[subject] =
          questionStatusFilter === "all"
            ? subjectQuestions.length
            : questionStatusFilter === "correct"
            ? subjectCorrectIds.length
            : questionStatusFilter === "incorrect"
            ? subjectIncorrectIds.length
            : questionStatusFilter === "unattempted"
            ? subjectUnattemptedIds.length
            : subjectFlaggedIds.length;

        // Derive topics for this subject
        const topics = [...new Set(subjectQuestions.flatMap((q) => 
          q.subjects.find(s => s.name === subject)?.topics || []
        ))].filter((t) => (topicsBySubject[subject] || []).includes(t));
        
        topics.forEach((topic) => {
          const topicQuestions = subjectQuestions.filter((q) => 
            q.subjects.some(s => s.name === subject && s.topics.includes(topic))
          );
          const topicHistory = subjectHistory.filter((q) => 
            q.subjects.some(s => s.name === subject && s.topics.includes(topic))
          );
          const topicCorrectIds = topicHistory
            .filter((q) => q.isCorrect)
            .map((q) => q._id.toString());
          const topicIncorrectIds = topicHistory
            .filter((q) => !q.isCorrect && q.selectedAnswer !== -1)
            .map((q) => q._id.toString());
          const topicFlaggedIds = topicHistory
            .filter((q) => q.selectedAnswer === -1)
            .map((q) => q._id.toString());
          const topicAllIds = topicQuestions.map((q) => q._id.toString());
          const topicUnattemptedIds = topicAllIds.filter(
            (id) =>
              !topicCorrectIds.includes(id) &&
              !topicIncorrectIds.includes(id) &&
              !topicFlaggedIds.includes(id)
          );

          topicCountMap[`${subject}||${topic}`] =
            questionStatusFilter === "all"
              ? topicQuestions.length
              : questionStatusFilter === "correct"
              ? topicCorrectIds.length
              : questionStatusFilter === "incorrect"
              ? topicIncorrectIds.length
              : questionStatusFilter === "unattempted"
              ? topicUnattemptedIds.length
              : topicFlaggedIds.length;
        });
      });

      setCategoryCounts(categoryCountMap);
      setSubjectCounts(subjectCountMap);
      setTopicCounts(topicCountMap);
      setTotalQuestions(allQuestions.length);
    } catch (err) {
      console.error("Error fetching counts:", err);
      setCategoryCounts(categoryCountMap);
      setSubjectCounts({});
      setTopicCounts({});
      setTotalQuestions(0);
    }
  };

  // Memoized question filtering
  const filteredQuestions = useMemo(() => {
    let result = questions;

    if (selectedSubjects.size > 0) {
      result = result.filter((q) =>
        Array.from(selectedSubjects).some((subject) => q.subjects.some(s => s.name === subject))
      );
      if (selectedTopics.size > 0) {
        result = result.filter((q) => {
          const subjectTopics = Array.from(selectedTopics.entries()).flatMap(([subject, topics]) =>
            topics.map((topic) => ({ subject, topic }))
          );
          return subjectTopics.some(
            ({ subject, topic }) => 
              q.subjects.some(s => s.name === subject && s.topics.includes(topic))
          );
        });
      }
    }

    return result;
  }, [questions, selectedSubjects, selectedTopics]);

  // Fetch questions based on top-level filters
  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      let allQuestions = [];

      const baseHistoryQuery = `/api/student-questions/history?category=${selectedCategory}${
        difficulty !== "all" ? `&difficulty=${difficulty}` : ""
      }`;

      if (questionStatusFilter === "correct") {
        const res = await axios.get(`${baseHistoryQuery}&isCorrect=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        allQuestions = res.data.data.map(normalizeStudentQuestion);
        setTotalQuestions(res.data.count || res.data.data.length);
      } else if (questionStatusFilter === "incorrect") {
        const res = await axios.get(`${baseHistoryQuery}&isCorrect=false&flagged=false`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        allQuestions = res.data.data.map(normalizeStudentQuestion);
        setTotalQuestions(res.data.count || res.data.data.length);
      } else if (questionStatusFilter === "flagged") {
        const res = await axios.get(`${baseHistoryQuery}&flagged=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        allQuestions = res.data.data.map(normalizeStudentQuestion);
        setTotalQuestions(res.data.count || res.data.data.length);
      } else if (questionStatusFilter === "unattempted") {
        const allQuestionsRes = await axios.get(
          `/api/questions?category=${selectedCategory}&createdBy=me${
            difficulty !== "all" ? `&difficulty=${difficulty}` : ""
          }`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const historyRes = await axios.get(baseHistoryQuery, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allAvailableQuestions = allQuestionsRes.data.data || [];
        const historyQuestions = historyRes.data.data || [];
        const historyIds = historyQuestions.map((q) => q.question._id.toString());
        allQuestions = allAvailableQuestions.filter((q) => !historyIds.includes(q._id.toString()));
        setTotalQuestions(allQuestions.length);
      } else {
        // questionStatusFilter === "all"
        const res = await axios.get(
          `/api/questions?category=${selectedCategory}&createdBy=me${
            difficulty !== "all" ? `&difficulty=${difficulty}` : ""
          }`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        allQuestions = res.data.data || [];
        setTotalQuestions(res.data.count || allQuestions.length);
      }

      setQuestions(allQuestions);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setQuestions([]);
      setTotalQuestions(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchCounts();
      fetchQuestions();
    }
  }, [questionStatusFilter, difficulty, selectedCategory]);

  const toggleSubject = (subject) => {
    setSelectedSubjects((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(subject)) {
        newSelection.delete(subject);
        setSelectedTopics((prevTopics) => {
          const newTopics = new Map(prevTopics);
          newTopics.delete(subject);
          return newTopics;
        });
      } else {
        newSelection.add(subject);
      }
      setActiveSubject(newSelection.size > 0 ? subject : null);
      return newSelection;
    });
  };

  const toggleTopic = (topic, subject) => {
    setSelectedTopics((prev) => {
      const newTopics = new Map(prev);
      const subjectTopics = newTopics.get(subject) || [];
      if (subjectTopics.includes(topic)) {
        newTopics.set(subject, subjectTopics.filter((t) => t !== topic));
      } else {
        newTopics.set(subject, [...subjectTopics, topic]);
      }
      if (newTopics.get(subject).length === 0) {
        newTopics.delete(subject);
      }
      return newTopics;
    });
  };

  const startTest = async () => {
    if (selectedSubjects.size === 0 || filteredQuestions.length === 0) {
      alert("Select at least one subject with available questions");
      return;
    }

    setIsLoading(true);
    try {
      // Clear any existing test data
      const existingTestData = sessionStorage.getItem("testData");
      if (existingTestData) {
        sessionStorage.removeItem("testData");
      }

      const shuffledQuestions = [...filteredQuestions].sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffledQuestions.slice(0, Math.min(numberOfItems, filteredQuestions.length));
      const questionIds = selectedQuestions.map((q) => q._id);

      const payload = {
        questionIds,
        difficulty: difficulty === "all" ? undefined : difficulty,
        count: questionIds.length,
      };

      const res = await axios.post("/api/tests", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to create test session.");
      }

      const { _id: testSessionId, questions: returnedQuestions } = res.data.data;
      if (!testSessionId || !returnedQuestions || returnedQuestions.length === 0) {
        throw new Error("Invalid test session data: Missing testSessionId or questions.");
      }

      const testData = {
        testSessionId,
        questions: returnedQuestions,
        testDuration: useTimer ? parseInt(testDuration) : 0,
        selectedFilters: {
          category: selectedCategory,
          subjects: Array.from(selectedSubjects),
          topics: Array.from(selectedTopics.entries()).reduce(
            (acc, [subject, topics]) => ({
              ...acc,
              [subject]: topics,
            }),
            {}
          ),
          difficulty,
          questionStatus: questionStatusFilter,
        },
      };

      sessionStorage.setItem("testData", JSON.stringify(testData));

      navigate("/dashboard/test-runner", {
        state: testData,
      });
    } catch (error) {
      console.error("Error starting test:", error);
      const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
      alert(`Failed to start test: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex items-center p-4 bg-white shadow">
        <div className="flex-1">
          <h3 className="font-medium text-gray-700 mb-2">Question Status</h3>
          <div className="flex gap-2">
            {[
              { value: "all", label: `All (Q${categoryCounts[selectedCategory]?.all || 0})` },
              { value: "correct", label: `Correct (Q${categoryCounts[selectedCategory]?.correct || 0})` },
              { value: "incorrect", label: `Incorrect (Q${categoryCounts[selectedCategory]?.incorrect || 0})` },
              { value: "unattempted", label: `Unattempted (Q${categoryCounts[selectedCategory]?.unattempted || 0})` },
              { value: "flagged", label: `Flagged (Q${categoryCounts[selectedCategory]?.flagged || 0})` },
            ].map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setQuestionStatusFilter(filter.value)}
                className={`flex-1 py-2 text-center font-medium transition-colors rounded ${
                  questionStatusFilter === filter.value
                    ? "bg-blue-500 text-white"
                    : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 ml-4">
          <h3 className="font-medium text-gray-700 mb-2">Difficulty</h3>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          >
            <option value="all">All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Select Category</h2>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex-1 py-3 text-center font-medium transition-colors rounded ${
                  selectedCategory === cat.name
                    ? "bg-blue-500 text-white"
                    : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                }`}
              >
                {cat.name} (Q{categoryCounts[cat.name]?.[questionStatusFilter] || 0})
              </button>
            ))}
          </div>
        </div>

        {selectedCategory && (
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-blue-600 mb-4">Select Subjects</h2>
            <div className="flex flex-wrap gap-4">
              {(subjectsByCategory[selectedCategory] || []).map((subject) => {
                const count = subjectCounts[subject] || 0;
                const isSelected = selectedSubjects.has(subject);
                return (
                  <label
                    key={subject}
                    className={`px-4 py-2 rounded border select-none flex items-center space-x-2 ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600"
                        : count === 0
                        ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                        : "bg-white text-blue-600 border-blue-600 hover:bg-blue-100 cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={count === 0}
                      onChange={() => toggleSubject(subject)}
                      className="hidden"
                    />
                    <span>{subject}</span>
                    <span className={`${count > 0 ? "text-green-600" : "text-red-500"} font-bold`}>
                      Q{count}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {selectedSubjects.size > 0 && (
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-blue-600 mb-4">Select Topics (Optional)</h2>
            <p className="text-sm text-gray-600 mb-4">
              Leave topics unselected to include all topics from selected subjects
            </p>
            <div className="flex gap-4 mb-4">
              {Array.from(selectedSubjects).map((subject) => (
                <button
                  key={subject}
                  onClick={() => setActiveSubject(subject)}
                  className={`px-4 py-2 rounded ${
                    activeSubject === subject
                      ? "bg-blue-600 text-white"
                      : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
            {activeSubject && (
              <div className="ml-4">
                <h3 className="text-md font-semibold text-gray-700 mb-3">{activeSubject}</h3>
                <div className="flex flex-wrap gap-4">
                  {(topicsBySubject[activeSubject] || []).map((topic) => {
                    const key = `${activeSubject}||${topic}`;
                    const count = topicCounts[key] || 0;
                    const isSelected = (selectedTopics.get(activeSubject) || []).includes(topic);

                    return (
                      <label
                        key={key}
                        className={`px-4 py-2 rounded border select-none flex items-center space-x-2 ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600"
                            : count === 0
                            ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-blue-100 cursor-pointer"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={count === 0}
                          onChange={() => toggleTopic(topic, activeSubject)}
                          className="hidden"
                        />
                        <span>{topic}</span>
                        <span className={`${count > 0 ? "text-green-600" : "text-red-500"} font-bold`}>
                          Q{count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-700 mb-3">Selected Filters</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedSubjects).map((subject) => (
                  <span
                    key={subject}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {subject}
                    {selectedTopics.get(subject)?.length > 0
                      ? ` → ${selectedTopics.get(subject).join(", ")}`
                      : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-green-50 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-green-700 mb-2">Available Questions</h3>
          <p className="text-green-600">
            {filteredQuestions.length} questions available with current filters
          </p>
          <p className="text-green-600 mt-1">
            {Math.min(numberOfItems, filteredQuestions.length)} questions selected for the test
            {numberOfItems > filteredQuestions.length && (
              <span className="text-orange-600 ml-2">
                (Requested {numberOfItems}, but only {filteredQuestions.length} available)
              </span>
            )}
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Test Configuration</h2>
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="flex items-center">
              <button
                onClick={() => setUseTimer(!useTimer)}
                className={`ml-0 relative inline-block w-12 h-6 rounded-full transition-all duration-300 bg-gradient-to-r bg-[length:200%_100%] ${
                  useTimer
                    ? "from-green-400 to-green-700 bg-right"
                    : "from-gray-300 to-gray-500 bg-left"
                }`}
                aria-label="Toggle timer"
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 bg-white shadow-md ${
                    useTimer ? "left-[calc(100%-1.25rem-0.125rem)]" : "left-0.5"
                  }`}
                ></span>
              </button>
              <label htmlFor="timerCheckbox" className="ml-3 cursor-pointer">
                Use 90 second timer
              </label>
            </div>

            <div className="flex-1">
              <h3 className="font-medium text-gray-700 mb-4">Number of Items</h3>
              <input
                type="number"
                value={numberOfItems}
                onChange={(e) => setNumberOfItems(parseInt(e.target.value) || 1)}
                className="border border-gray-300 rounded px-3 py-2 w-24"
                min="1"
                max={filteredQuestions.length || 150}
              />
              {filteredQuestions.length > 0 && numberOfItems > filteredQuestions.length && (
                <p className="text-sm text-orange-600 mt-1">
                  Max available: {filteredQuestions.length}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded flex items-center"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
          </button>

          <button
            onClick={startTest}
            disabled={isLoading || selectedSubjects.size === 0 || filteredQuestions.length === 0}
            className={`${
              selectedSubjects.size > 0 && filteredQuestions.length > 0
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-200 text-gray-700 cursor-not-allowed"
            } px-8 py-2 rounded`}
          >
            {isLoading
              ? "Starting..."
              : `Start Test (${Math.min(numberOfItems, filteredQuestions.length)} questions)`}
          </button>
        </div>
      </div>
    </div>
  );
}