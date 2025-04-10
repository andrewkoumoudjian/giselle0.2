import React, { useState, useRef } from 'react';
import { FaUpload, FaFile, FaFilePdf, FaFileWord, FaTrash, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import TailwindSpinner from './ui/TailwindSpinner';
import { analyzeResume } from '../utils/api';

const ResumeUploader = ({ onAnalysisComplete, jobId = null }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  // Handle file selection
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Check file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or Word document');
      return;
    }
    
    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    
    // Start upload and analysis
    await analyzeResumeFile(selectedFile);
  };
  
  // Analyze resume file
  const analyzeResumeFile = async (resumeFile) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      // Call API to analyze resume
      const analysisResult = await analyzeResume(resumeFile, jobId);
      
      // Complete the upload
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Set analysis result
      setAnalysis(analysisResult);
      
      // Call the callback function if provided
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult);
      }
    } catch (err) {
      console.error('Resume analysis error:', err);
      setError('Failed to analyze resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  // Remove uploaded file
  const handleRemoveFile = () => {
    setFile(null);
    setUploadProgress(0);
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Get file icon based on file type
  const getFileIcon = (file) => {
    if (!file) return FaFile;
    
    if (file.type === 'application/pdf') {
      return FaFilePdf;
    } else if (file.type.includes('word')) {
      return FaFileWord;
    } else {
      return FaFile;
    }
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };
  
  const FileIcon = getFileIcon(file);
  
  return (
    <div className="w-full">
      {/* Error message */}
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 ${
          file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary-500'
        } transition-colors duration-200`}
      >
        {!file ? (
          <div className="flex flex-col items-center justify-center">
            <FaUpload className="h-10 w-10 text-gray-400 mb-3" />
            <p className="text-lg font-medium text-gray-700 mb-1">Upload your resume</p>
            <p className="text-sm text-gray-500 mb-4">PDF or Word document, max 5MB</p>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Select File
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              className="hidden"
            />
          </div>
        ) : (
          <div className="flex flex-col">
            {uploading ? (
              <div className="flex flex-col items-center">
                <p className="text-lg font-medium text-gray-700 mb-3">Analyzing resume...</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <TailwindSpinner size="md" color="primary" />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FileIcon className="h-8 w-8 text-primary-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="inline-flex items-center p-1.5 border border-transparent rounded-full text-gray-500 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
                
                {analysis && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-md">
                    <h3 className="text-md font-medium text-blue-800 mb-2">Resume Analysis</h3>
                    
                    {/* Match score */}
                    {analysis.match_score && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Match Score</span>
                          <span className={`text-sm font-medium ${
                            analysis.match_score >= 80 ? 'text-green-600' : 
                            analysis.match_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {analysis.match_score}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              analysis.match_score >= 80 ? 'bg-green-500' : 
                              analysis.match_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${analysis.match_score}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Skills */}
                    {analysis.skills && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.skills.matched && analysis.skills.matched.map((skill, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <FaCheckCircle className="mr-1 h-3 w-3" />
                              {skill}
                            </span>
                          ))}
                          
                          {analysis.skills.missing && analysis.skills.missing.map((skill, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              <FaExclamationTriangle className="mr-1 h-3 w-3" />
                              {skill}
                            </span>
                          ))}
                          
                          {analysis.skills.additional && analysis.skills.additional.map((skill, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Experience */}
                    {analysis.experience && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Experience</p>
                        <p className="text-sm text-gray-600">
                          {analysis.experience.years || analysis.experience.relevant_years || analysis.experience.total_years} years
                          {analysis.experience.job_titles && analysis.experience.job_titles.length > 0 && 
                            ` as ${analysis.experience.job_titles.join(', ')}`
                          }
                        </p>
                      </div>
                    )}
                    
                    {/* Education */}
                    {analysis.education && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Education</p>
                        <p className="text-sm text-gray-600">
                          {analysis.education.highest_degree || 
                           (analysis.education.degrees && analysis.education.degrees[0]) || 
                           'Not specified'}
                        </p>
                      </div>
                    )}
                    
                    {/* Recommendations */}
                    {analysis.recommendations && analysis.recommendations.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Recommendations</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {analysis.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUploader;
