import React, { useRef, useState } from 'react';
import { Upload, File, X, ArrowLeft, ArrowRight, Cloud, Zap, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { resumeAPI } from '../utils/api';

const FileUpload: React.FC = () => {
  const { 
    uploadedFiles, 
    setUploadedFiles, 
    setUploadedResumeIds,
    setCurrentStep, 
    setCandidates,
    setFilteredCandidates,
    setLoading,
    setLoadingMessage,
    jobRequirement,
    currentJobId
  } = useApp();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: File[] = [];
    const rejectedFiles: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (uploadedFiles.length + newFiles.length >= 1000) {
        alert('Maximum 1000 files allowed');
        break;
      }

      const fileName = file.name.toLowerCase();
      const fileSize = file.size / (1024 * 1024); // Convert to MB
      
      if (fileName.endsWith('.pdf') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        if (fileSize <= 10) { // 10MB limit
          newFiles.push(file);
        } else {
          rejectedFiles.push(`${file.name} (too large - max 10MB)`);
        }
      } else {
        rejectedFiles.push(`${file.name} (unsupported format)`);
      }
    }

    if (rejectedFiles.length > 0) {
      alert(`Some files were rejected:\n${rejectedFiles.join('\n')}`);
    }

    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processFiles = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one resume.');
      return;
    }

    if (!currentJobId) {
      alert('Job requirements not found. Please go back and set up the job first.');
      return;
    }

    setLoading(true);
    setLoadingMessage('Uploading resumes...');

    try {
      // Simulate upload progress
      for (let i = 0; i <= 50; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Upload resumes
      const uploadResponse = await resumeAPI.uploadResumes(uploadedFiles);
      setUploadedResumeIds(uploadResponse.resume_ids);

      // Update progress
      setUploadProgress(75);
      setLoadingMessage('Processing and screening resumes...');

      // Screen resumes
      const screenResponse = await resumeAPI.screenResumes({
        job_id: currentJobId,
        resume_ids: uploadResponse.resume_ids
      });

      // Sort by match score
      // ==================================================================
      //          *** START: DATA TRANSFORMATION LOGIC ***
      // Here, we map the raw API data (with snake_case) to the format
      // our React application expects (with camelCase).
      // ==================================================================
      const transformedCandidates = screenResponse.results.map((apiCandidate: any) => ({
        id: apiCandidate.resume_id,
        filename: apiCandidate.filename,
        filepath: apiCandidate.filepath,
        matchScore: apiCandidate.match_score,      // Map 'match_score' to 'matchScore'
        matchedSkills: apiCandidate.matched_skills,  // Map 'matched_skills' to 'matchedSkills'
        category: apiCandidate.categorized_field,  // Map 'categorized_field' to 'category'
        experience: apiCandidate.experience_level || 'Not Specified', // Provide a fallback
        rawText: apiCandidate.raw_text,
        resume_id: apiCandidate.resume_id          // Keep resume_id as well if needed elsewhere
      }));
      // ==================================================================
      //           *** END: DATA TRANSFORMATION LOGIC ***
      // ==================================================================


      const sortedCandidates = transformedCandidates.sort((a, b) => b.matchScore - a.matchScore);

      // Set the application state with the correctly formatted data
      setCandidates(sortedCandidates);
      setFilteredCandidates(sortedCandidates);
      setUploadProgress(100);
      setCurrentStep(2);
    } catch (error: any) {
      alert(error.message || 'An error occurred while processing resumes. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Process 1000+ resumes in seconds",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Bank-grade encryption for your data",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Cloud Powered",
      description: "Unlimited storage and processing",
      color: "from-blue-500 to-cyan-500"
    }
  ];

  const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="min-h-screen py-4 md:py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-100 px-3 py-2 md:px-4 md:py-2 rounded-full mb-4 md:mb-6">
              <Upload className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
              <span className="text-purple-800 font-semibold text-sm md:text-base">Step 2 of 3</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
              Upload Your
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block md:inline"> Resume Collection</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Upload candidate resumes and let our AI analyze them instantly with 99.7% accuracy
            </p>
          </div>

          {/* Job Requirement Summary */}
          {jobRequirement && (
            <div className="mb-8 md:mb-12 mx-4 md:mx-0">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 md:p-6 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Screening for: {jobRequirement.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Experience Level:</span>
                    <span className="ml-2 font-medium text-blue-600">{jobRequirement.experience}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Department:</span>
                    <span className="ml-2 font-medium text-purple-600">{jobRequirement.department}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-gray-600 text-sm">Required Skills:</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {jobRequirement.skills.slice(0, 8).map((skill, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                    {jobRequirement.skills.length > 8 && (
                      <span className="text-xs text-gray-500">+{jobRequirement.skills.length - 8} more</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12 mx-4 md:mx-0">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-center shadow-lg border border-gray-100/50">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Upload Area */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 md:p-8 shadow-xl border border-gray-100/50 mb-6 md:mb-8 mx-4 md:mx-0">
            <div
              className={`border-3 border-dashed rounded-3xl p-8 md:p-12 text-center transition-all duration-300 cursor-pointer ${
                dragOver 
                  ? 'border-purple-500 bg-purple-50 transform scale-105' 
                  : 'border-purple-300 bg-purple-50/50 hover:border-purple-400 hover:bg-purple-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg">
                <Upload size={32} className="text-white md:w-10 md:h-10" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                Drop files here or click to upload
              </h3>
              <p className="text-gray-600 mb-3 md:mb-4 text-base md:text-lg">
                Supports PDF, DOC, DOCX files • Maximum 1000 files • 10MB per file
              </p>
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">Your files are encrypted and secure</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Processing files...</span>
                  <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* File List */}
          {uploadedFiles.length > 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 md:p-8 shadow-xl border border-gray-100/50 mb-6 md:mb-8 mx-4 md:mx-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Uploaded Files ({uploadedFiles.length})
                </h3>
                <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-500">
                  <div>Total size: {formatFileSize(totalSize)}</div>
                  <div className="hidden sm:block">•</div>
                  <div>Ready for processing</div>
                </div>
              </div>
              
              <div className="max-h-80 overflow-y-auto space-y-3">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
                        <File size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 truncate">{file.name}</div>
                        <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0 ml-4"
                      title="Remove file"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>

              {/* File Statistics */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Files Ready for Processing</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-green-600">Total Files:</span>
                    <span className="ml-2 font-semibold text-green-800">{uploadedFiles.length}</span>
                  </div>
                  <div>
                    <span className="text-green-600">Total Size:</span>
                    <span className="ml-2 font-semibold text-green-800">{formatFileSize(totalSize)}</span>
                  </div>
                  <div>
                    <span className="text-green-600">PDF Files:</span>
                    <span className="ml-2 font-semibold text-green-800">
                      {uploadedFiles.filter(f => f.name.toLowerCase().endsWith('.pdf')).length}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-600">DOC Files:</span>
                    <span className="ml-2 font-semibold text-green-800">
                      {uploadedFiles.filter(f => f.name.toLowerCase().endsWith('.doc') || f.name.toLowerCase().endsWith('.docx')).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mx-4 md:mx-0">
            <button
              onClick={() => setCurrentStep(0)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold order-2 sm:order-1"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Job Setup</span>
              <span className="sm:hidden">Back</span>
            </button>
            
            <button
              onClick={processFiles}
              disabled={uploadedFiles.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 md:px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none order-1 sm:order-2"
            >
              {uploadedFiles.length === 0 ? (
                <>
                  <AlertCircle size={20} />
                  Upload Files First
                </>
              ) : (
                <>
                  Process {uploadedFiles.length} Resume{uploadedFiles.length !== 1 ? 's' : ''} with AI
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          {uploadedFiles.length === 0 && (
            <div className="text-center mt-8 mx-4 md:mx-0">
              <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800 text-sm">Upload at least one resume to continue</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;