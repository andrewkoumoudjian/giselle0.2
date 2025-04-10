import React from 'react';
import Link from 'next/link';
import { FaBriefcase, FaMapMarkerAlt, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';

const TailwindJobCard = ({ job }) => {
  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="card group transform hover:-translate-y-1 transition-all duration-300">
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-primary-600 transition-colors">
            {job.title}
          </h3>
          <div className="flex items-center text-gray-600 mb-2">
            <FaBriefcase className="mr-2 text-primary-500" />
            <span>{job.company}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="flex items-center text-gray-500 text-sm">
              <FaMapMarkerAlt className="mr-1" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <FaCalendarAlt className="mr-1" />
              <span>Posted {formatDate(job.posted_date)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="badge badge-primary">{job.job_type}</span>
            {job.salary_range && (
              <span className="badge badge-success flex items-center">
                <FaDollarSign className="mr-1" />
                {job.salary_range}
              </span>
            )}
          </div>
        </div>
        
        <div className="text-gray-700 mb-6 flex-grow">
          <p className="line-clamp-3">{job.description}</p>
        </div>
        
        {job.skills && job.skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {job.skills.slice(0, 3).map((skill, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {skill}
                </span>
              ))}
              {job.skills.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{job.skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-auto">
          <Link 
            href={`/jobs/${job.id}`}
            className="btn-secondary text-sm"
          >
            View Details
          </Link>
          <Link 
            href={`/jobs/${job.id}/apply`}
            className="btn-primary text-sm"
          >
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TailwindJobCard;
