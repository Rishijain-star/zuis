import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Image as ImageIcon, Edit, Trash2, ArrowLeft } from "lucide-react";
import MediaDisplay from "./MediaDisplay";

const MyCreatedQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    limit: 10,
  });
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCreatedQuestions = async () => {
      try {
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch(
          `https://synapaxon-backend.onrender.com/api/questions?createdBy=me&page=${pagination.current}&limit=${pagination.limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch questions: ${response.statusText}`);
        }

        const responseData = await response.json();
        if (responseData.success) {
          setQuestions(responseData.data || []);
          setPagination({
            current: responseData.pagination?.current || 1,
            pages: responseData.pagination?.pages || 1,
            limit: responseData.pagination?.limit || 10,
          });
          setTotalQuestions(responseData.total || 0);
        } else {
          throw new Error(responseData.message || "Failed to fetch questions");
        }
      } catch (err) {
        console.error("Error fetching created questions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatedQuestions();
  }, [pagination.current, token]);

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, current: page }));
  };

  const toggleQuestion = (questionId) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleRequestEdit = async (questionId) => {
    try {
      const response = await fetch(
        `https://synapaxon-backend.onrender.com/api/questions/${questionId}/request-edit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to request edit");
      }

      const responseData = await response.json();
      alert(responseData.message || "Edit request submitted successfully");
    } catch (err) {
      console.error("Error requesting edit:", err);
      alert(`Failed to request edit: ${err.message}`);
    }
  };

  const handleRequestDelete = async (questionId) => {
    if (!window.confirm("Are you sure you want to request deletion of this question?")) {
      return;
    }

    try {
      const response = await fetch(
        `https://synapaxon-backend.onrender.com/api/questions/${questionId}/request-delete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to request delete");
      }

      const responseData = await response.json();
      alert(responseData.message || "Delete request submitted successfully");
      setPagination((prev) => ({ ...prev, current: 1 }));
    } catch (err) {
      console.error("Error requesting delete:", err);
      alert(`Failed to request delete: ${err.message}`);
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 mb-4 mx-auto"></div>
          <div className="text-gray-600 text-lg font-medium">
            Loading your created questions...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-full mx-auto mt-12 p-8 bg-red-50 border border-red-300 rounded-2xl shadow-lg">
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
    <div className="min-h-screen bg-gray-50 py-12 px-8">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">My Created Questions</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-600 p-8 text-white flex justify-between items-center">
            <h2 className="text-2xl font-bold">My Created Questions</h2>
            <div className="text-base font-semibold">
              Total Questions:{" "}
              <span className="bg-white text-indigo-600 px-3 py-1 rounded-full">
                {totalQuestions}
              </span>
            </div>
          </div>

          <div className="p-8">
            {questions.length === 0 ? (
              <div className="p-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <ImageIcon className="w-16 h-16 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    No Questions Created
                  </h3>
                  <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                    Start contributing by creating your first question for the platform.
                  </p>
                  <button
                    onClick={() => navigate("/dashboard/create")}
                    className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Create a Question
                  </button>
                </div>
              </div>
            ) : (
              <>
                {questions.map((question, qIndex) => (
                  <div
                    key={question._id}
                    className="mb-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleQuestion(question._id)}
                      className="w-full p-8 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Q{qIndex + 1}: {question.questionText || "Question not available"}
                        </h3>
                        {question.questionMedia?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {question.questionMedia.map((media, index) => (
                              <MediaDisplay
                                key={index}
                                media={media}
                                label={`Question Media ${index + 1}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      {expandedQuestions[question._id] ? (
                        <ChevronUp className="w-6 h-6 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-600" />
                      )}
                    </button>
                    {expandedQuestions[question._id] && (
                      <div className="p-8 border-t border-gray-200">
                        <div className="space-y-4 mb-6">
                          {question.options?.map((option, oIndex) => (
                            <div
                              key={oIndex}
                              className={`p-4 rounded-lg flex items-center space-x-4 ${
                                question.correctAnswer === oIndex
                                  ? "bg-blue-50 border border-blue-200"
                                  : "bg-gray-50 border border-gray-200"
                              }`}
                            >
                              <div className="flex-shrink-0">
                                {question.correctAnswer === oIndex ? (
                                  <svg
                                    className="w-6 h-6 text-blue-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
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
                                  {String.fromCharCode(65 + oIndex)}. {option.text || "Option not available"}
                                </p>
                                {option.media?.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {option.media.map((media, mediaIndex) => (
                                      <MediaDisplay
                                        key={mediaIndex}
                                        media={media}
                                        label={`Option ${String.fromCharCode(65 + oIndex)} Media ${mediaIndex + 1}`}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6">
                          <h4 className="text-base font-semibold text-gray-900 mb-2">
                            Explanation
                          </h4>
                          {(() => {
                            const explanation = question.explanation || "";
                            if (!explanation) {
                              return (
                                <p className="text-base text-gray-700">
                                  No explanation available
                                </p>
                              );
                            }
                            const segments = explanation
                              .split(".")
                              .map((s) => s.trim())
                              .filter((s) => s.length > 0);
                            if (segments.length <= 1) {
                              return (
                                <p className="text-base text-gray-700">
                                  {explanation}
                                </p>
                              );
                            } else {
                              return (
                                <ul className="list-disc pl-5 space-y-2 text-gray-700 text-base">
                                  {segments.map((segment, idx) => (
                                    <li key={idx}>{segment}.</li>
                                  ))}
                                </ul>
                              );
                            }
                          })()}
                          {question.explanationMedia?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {question.explanationMedia.map((media, index) => (
                                <MediaDisplay
                                  key={index}
                                  media={media}
                                  label={`Explanation Media ${index + 1}`}
                                />
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
                          <span className="mx-2">•</span>
                          <span>Created: {formatDate(question.createdAt)}</span>
                        </div>
                        <div className="mt-6 flex justify-end space-x-4">
                          <button
                            onClick={() => handleRequestEdit(question._id)}
                            className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                          >
                            <Edit className="w-5 h-5 mr-2" />
                            Request Edit
                          </button>
                          <button
                            onClick={() => handleRequestDelete(question._id)}
                            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-5 h-5 mr-2" />
                            Request Delete
                          </button>
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

export default MyCreatedQuestionsPage;