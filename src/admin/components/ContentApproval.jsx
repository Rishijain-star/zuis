import { useState } from 'react';

const ContentApproval = () => {
  const [submissions, setSubmissions] = useState([
    { id: 1, content: 'What is the capital of Spain?', type: 'Question', status: 'Pending' },
    { id: 2, content: 'This is a great article!', type: 'Comment', status: 'Pending' },
    { id: 3, content: 'Explain the theory of relativity', type: 'Question', status: 'Pending' },
  ]);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Approval</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{submission.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{submission.content}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{submission.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{submission.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-green-600 hover:text-green-900 mr-2">Approve</button>
                  <button className="text-red-600 hover:text-red-900">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContentApproval;