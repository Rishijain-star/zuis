import QuestionManagement from '../components/QuestionManagement';

const Questions = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
        <p className="mt-1 text-sm text-gray-600">Manage all questions</p>
      </div>
      <QuestionManagement />
    </div>
  );
};

export default Questions;