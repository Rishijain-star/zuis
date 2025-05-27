import UserManagement from '../components/UserManagement';

const Users = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <p className="mt-1 text-sm text-gray-600">Manage user accounts and permissions</p>
      </div>
      <UserManagement />
    </div>
  );
};

export default Users;