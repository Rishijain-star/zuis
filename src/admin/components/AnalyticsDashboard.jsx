    import StatsCard from './StatsCard';

const AnalyticsDashboard = () => {
  const stats = [
    { title: 'Total Users', value: '8,542' },
    { title: 'Active Users (30d)', value: '3,219' },
    { title: 'Questions Submitted', value: '12,456' },
    { title: 'Pending Approvals', value: '42' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} title={stat.title} value={stat.value} />
        ))}
      </div>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Trends</h3>
        <div className="h-64 flex items-center justify-center bg-gray-100 rounded-md">
          <p className="text-gray-500">Chart placeholder (e.g., user activity over time)</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;