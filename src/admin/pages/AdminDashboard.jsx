import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/StatsCard';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { name: 'Total Users', value: '8,542', change: '+12%', changeType: 'positive' },
    { name: 'Active Users (30d)', value: '3,219', change: '+7.8%', changeType: 'positive' },
    { name: 'Questions in Bank', value: '12,456', change: '+3.2%', changeType: 'positive' },
    { name: 'Pending Approvals', value: '42', change: '-5.6%', changeType: 'negative' },
  ];

  const recentActivity = [
    { id: 1, user: 'medical_student1', action: 'submitted a new question', time: '2 hours ago' },
    { id: 2, user: 'future_doctor', action: 'completed a practice test', time: '4 hours ago' },
    { id: 3, user: 'admin_user', action: 'approved 5 questions', time: '1 day ago' },
    { id: 4, user: 'anatomy_learner', action: 'updated their profile', time: '1 day ago' },
    { id: 5, user: 'med_school_2023', action: 'subscribed to Premium', time: '2 days ago' },
  ];

  const quickActions = [
    { name: 'Add New Question', path: '/admin/questions', icon: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z', color: 'bg-indigo-100 text-indigo-600' },
    { name: 'Manage Users', path: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'bg-green-100 text-green-600' },
    { name: 'Review Content', path: '/admin/content', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'bg-yellow-100 text-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-gray-600">Overview of platform activity and quick access to key tasks</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatsCard key={stat.name} stat={stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.name}
              onClick={() => navigate(action.path)}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center transition-transform transform hover:scale-105"
            >
              <div className={`p-2 rounded-full ${action.color} mr-3`}>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{action.name}</p>
                <p className="text-xs text-gray-500">Access {action.name.toLowerCase()}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <tr key={activity.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <img className="h-8 w-8 rounded-full" src={`https://i.pravatar.cc/150?u=${activity.user}`} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{activity.user}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{activity.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{activity.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;