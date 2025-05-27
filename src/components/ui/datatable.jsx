import { useState } from "react";
import { QuestionModal } from "./questionmodel";

export const DataTable = ({ dataByCategory, icon: Icon }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    category: "",
    type: "",
    count: 0,
    questions: [],
  });

  const safeNumber = (v, d = 0) => {
    const n = Number(v);
    return isNaN(n) || !isFinite(n) ? d : n;
  };

  const getPercentage = (c, i) => {
    const total = safeNumber(c) + safeNumber(i);
    return total === 0 ? 0 : Math.round((safeNumber(c) / total) * 100);
  };

  const handleNumberClick = (category, type, count, questions) => {
    if (count > 0) {
      setModalState({ isOpen: true, category, type, count, questions });
    }
  };

  const closeModal = () =>
    setModalState({
      isOpen: false,
      category: "",
      type: "",
      count: 0,
      questions: [],
    });

  // Group by category + subject


  return (
    <>
      {Object.entries(dataByCategory).map(([category, subjects]) => (
        <div
          key={category}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Icon className="mr-2 h-5 w-5 text-blue-500" />
            {category}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Subject</th>
                  <th className="text-center py-2">Questions</th>
                  <th className="text-center py-2">Correct</th>
                  <th className="text-center py-2">Incorrect</th>
                  <th className="text-center py-2">Ratio</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((item, idx) => {
                  const totalQ = item.questions.length;
                  return (
                    <tr key={idx} className="border-b border-gray-50">
                      <td className="py-2 font-medium text-gray-800">
                        {item.subject}
                      </td>
                      <td className="text-center py-2 font-medium">{totalQ}</td>
                      <td className="text-center py-2">
                        <button
                          onClick={() =>
                            handleNumberClick(
                              item.subject,
                              "correct",
                              item.correctAnswers,
                              item.questions.filter((q) => q.isCorrect)
                            )
                          }
                          disabled={item.correctAnswers === 0}
                          className={`text-green-600 font-medium transition ${
                            item.correctAnswers > 0
                              ? "hover:text-green-700 hover:bg-green-50 cursor-pointer px-2 py-1 rounded-md"
                              : "cursor-default"
                          }`}
                        >
                          {item.correctAnswers}
                        </button>
                      </td>
                      <td className="text-center py-2">
                        <button
                          onClick={() =>
                            handleNumberClick(
                              item.subject,
                              "incorrect",
                              item.incorrectAnswers,
                              item.questions.filter((q) => !q.isCorrect)
                            )
                          }
                          disabled={item.incorrectAnswers === 0}
                          className={`text-red-600 font-medium transition ${
                            item.incorrectAnswers > 0
                              ? "hover:text-red-700 hover:bg-red-50 cursor-pointer px-2 py-1 rounded-md"
                              : "cursor-default"
                          }`}
                        >
                          {item.incorrectAnswers}
                        </button>
                      </td>
                      <td className="text-center py-2 font-medium">
                        {getPercentage(
                          item.correctAnswers,
                          item.incorrectAnswers
                        )}
                        %
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <QuestionModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        category={modalState.category}
        type={modalState.type}
        count={modalState.count}
        questions={modalState.questions}
      />
    </>
  );
};
