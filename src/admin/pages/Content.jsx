import ContentApproval from '../components/ContentApproval';

const Content = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Content Approval</h2>
        <p className="mt-1 text-sm text-gray-600">Review and approve user-submitted content</p>
      </div>
      <ContentApproval />
    </div>
  );
};

export default Content;