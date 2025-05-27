import AnalyticsDashboard from '../components/AnalyticsDashboard';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="mt-1 text-sm text-gray-600">View platform analytics and statistics</p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
};

export default Analytics;