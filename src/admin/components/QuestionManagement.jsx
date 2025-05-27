import { useState } from 'react';
import ConfirmationDialog from './ConfirmationDialog';

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([
    { id: 1, title: 'What is the capital of Spain?', category: 'Geography', status: 'Approved' },
    { id: 2, title: 'Explain quantum physics', category: 'Science', status: 'Pending' },
    { id: 3, title: 'Who wrote Hamlet?', category: 'Literature', status: 'Approved' },
  ]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [editQuestion, setEditQuestion] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  const handleEdit = (question) => {
    setEditQuestion({ ...question });
    setSelectedQuestion(null);
  };

  const handleSaveEdit = () => {
    setQuestions(questions.map(q => (q.id === editQuestion.id ? editQuestion : q)));
    setEditQuestion(null);
  };

  const handleDelete = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
    setIsDeleteDialogOpen(false);
    setQuestionToDelete(null);
  };

  const openDeleteDialog = (question) => {
    setQuestionToDelete(question);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Management</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {questions.map((question) => (
              <tr key={question.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{question.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{question.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{question.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{question.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setSelectedQuestion(question)}
                    className="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(question)}
                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteDialog(question)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h4 className="text-lg font-semibold mb-4">Question Details</h4>
            <p><strong>ID:</strong> {selectedQuestion.id}</p>
            <p><strong>Title:</strong> {selectedQuestion.title}</p>
            <p><strong>Category:</strong> {selectedQuestion.category}</p>
            <p><strong>Status:</strong> {selectedQuestion.status}</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedQuestion(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editQuestion && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h4 className="text-lg font-semibold mb-4">Edit Question</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={editQuestion.title}
                  onChange={(e) => setEditQuestion({ ...editQuestion, title: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  value={editQuestion.category}
                  onChange={(e) => setEditQuestion({ ...editQuestion, category: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={editQuestion.status}
                  onChange={(e) => setEditQuestion({ ...editQuestion, status: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={() => setEditQuestion(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => handleDelete(questionToDelete?.id)}
        message={`Are you sure you want to delete the question: "${questionToDelete?.title}"?`}
      />
    </div>
  );
};

export default QuestionManagement;