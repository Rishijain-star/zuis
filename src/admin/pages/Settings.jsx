import PlatformSettings from '../components/PlatformSettings';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
        <p className="mt-1 text-sm text-gray-600">Configure platform settings</p>
      </div>
      <PlatformSettings />
    </div>
  );
};

export default Settings;