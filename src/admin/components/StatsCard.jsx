const StatsCard = ({ title, value }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-indigo-600">{value}</p>
    </div>
  );
};

export default StatsCard;