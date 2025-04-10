import React from 'react';
import { FaBriefcase, FaUsers, FaChartLine, FaUserClock } from 'react-icons/fa';

const StatCard = ({ title, value, icon: Icon, change, changeText, color }) => {
  const isPositive = change > 0;
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-500',
    green: 'bg-green-50 text-green-700 border-green-500',
    purple: 'bg-purple-50 text-purple-700 border-purple-500',
    orange: 'bg-orange-50 text-orange-700 border-orange-500',
  };
  
  const iconBgClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className={`rounded-lg shadow-card p-5 border-l-4 ${colorClasses[color]} bg-white`}>
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-semibold mt-1">{value}</p>
          {change !== undefined && (
            <p className="text-xs mt-1">
              <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                {isPositive ? '+' : ''}{change}
              </span>
              {' '}{changeText}
            </p>
          )}
        </div>
        <div className={`flex items-center justify-center rounded-full h-12 w-12 ${iconBgClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

const TailwindDashboardStats = ({ stats }) => {
  // If no stats are provided, use default mock data
  const data = stats || {
    activeJobs: 12,
    totalApplications: 143,
    newApplications: 28,
    averageScore: 76,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Active Jobs"
        value={data.activeJobs}
        icon={FaBriefcase}
        changeText="job listings currently active"
        color="blue"
      />
      
      <StatCard
        title="Total Applications"
        value={data.totalApplications}
        icon={FaUsers}
        change={data.newApplications}
        changeText="since last week"
        color="green"
      />
      
      <StatCard
        title="Average Match Score"
        value={`${data.averageScore}%`}
        icon={FaChartLine}
        changeText="based on all applications"
        color="purple"
      />
      
      <StatCard
        title="New Applications"
        value={data.newApplications}
        icon={FaUserClock}
        changeText="in the last 7 days"
        color="orange"
      />
    </div>
  );
};

export default TailwindDashboardStats;
