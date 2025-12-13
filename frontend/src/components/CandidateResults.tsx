import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Eye, Filter, RotateCcw, Users, FileDown, Archive, ArrowLeft, Star, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { resumeAPI, dashboardAPI } from '../utils/api';

const CandidateResults: React.FC = () => {
  const {
    candidates,
    filteredCandidates,
    setFilteredCandidates,
    uploadedFiles,
    setShowModal,
    setModalData,
    setCurrentStep,
    jobRequirement,
    currentJobId,
    setLoading,
    setLoadingMessage
  } = useApp();

  const [filters, setFilters] = useState({
    category: '',
    minScore: 0,
    maxScore: 100,
    showTop: 10
  });
  const [showingAll, setShowingAll] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  useEffect(() => {
    applyFilters();
    loadDashboardStats();
  }, [candidates, filters, showingAll]);

  const loadDashboardStats = async () => {
    try {
      const stats = await dashboardAPI.getHiringStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = candidates.filter(candidate => {
      const meetsCategory = filters.category === '' || candidate.category === filters.category;
      const meetsMinScore = candidate.matchScore >= filters.minScore;
      const meetsMaxScore = candidate.matchScore <= filters.maxScore;
      return meetsCategory && meetsMinScore && meetsMaxScore;
    });

    if (!showingAll) {
      filtered = filtered.slice(0, filters.showTop);
    }

    setFilteredCandidates(filtered);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name.includes('Score') || name === 'showTop' ? parseInt(value) || 0 : value
    }));
  };

  const viewResume = async (candidate: any) => {
    if (!candidate.resume_id) {
      setModalData({
        title: `${candidate.filename.split('.')[0]} - Resume`,
        content: candidate.rawText || 'Resume content not available.'
      });
      setShowModal('resume');
      return;
    }

    setLoading(true);
    setLoadingMessage('Loading resume content...');

    try {
      const response = await resumeAPI.getResumeContent(candidate.resume_id);
      setModalData({
        id: candidate.resume_id,
        filename: candidate.filename,
        filepath: candidate.filepath,  // Add filepath for better extension checking
        title: `${candidate.filename.split('.')[0]} - Resume`,
        content: response.content || 'Resume content not available.'
      });
      setShowModal('resume');
    } catch (error: any) {
      alert(error.message || 'Failed to load resume content.');
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = async (candidate: any) => {
    if (!candidate.resume_id || !candidate.filepath) {
      alert('Resume download not available for this candidate.');
      return;
    }

    setLoading(true);
    setLoadingMessage('Preparing download...');

    try {
      const response = await resumeAPI.downloadResume({
        resumeId: candidate.resume_id,
        filepath: candidate.filepath
      });

      // Create download link
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = candidate.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.message || 'Failed to download resume.');
    } finally {
      setLoading(false);
    }
  };

  const downloadAllFiltered = async () => {
    if (filteredCandidates.length === 0) {
      alert('No candidates to download.');
      return;
    }

    if (!currentJobId) {
      alert('Job ID not found. Cannot download filtered resumes.');
      return;
    }

    setLoading(true);
    setLoadingMessage('Preparing filtered resumes download...');

    try {
      const resumeIds = filteredCandidates
        .map(c => c.resume_id)
        .filter((id): id is string => !!id);

      const response = await resumeAPI.downloadFilteredResumes({
        job_id: currentJobId,
        filtered_resume_ids: resumeIds,
        filters: filters
      });
      // Create download link for zip file
      if (response instanceof Blob) {
        const url = window.URL.createObjectURL(response);
        const link = document.createElement('a');
        link.href = url;
        link.download = `filtered_resumes_${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Unexpected response. Download failed. Please try again.');
      }
    } catch (error: any) {
      console.error("Error in downloadAllFiltered:", error);
      alert(error.message || 'Failed to download filtered resumes.');
    } finally {
      setLoading(false);
    }
  };

  const downloadAllResumes = async () => {
    if (!currentJobId) {
      alert('Job ID not found. Cannot download all resumes.');
      return;
    }

    setLoading(true);
    setLoadingMessage('Preparing all resumes download...');

    try {
      const response = await resumeAPI.downloadAllResumes(currentJobId);

      // Create download link for zip file
      const blob = new Blob([response], { type: 'application/zip' });
      if (response instanceof Blob) {
        const url = window.URL.createObjectURL(response);
        const link = document.createElement('a');
        link.href = url;
        link.download = `all_resumes_${new Date().toISOString().split('T')[0]}.zip`; // or dynamic name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Unexpected response. Download failed. Please try again.');
      }

    } catch (error: any) {
      console.error("Error in downloadAllResumes:", error);
      alert(error.message || 'Failed to download all resumes.');
    } finally {
      setLoading(false);
    }
  };

  const restartProcess = () => {
    setShowModal('restart');
  };

  const toggleShowAll = () => {
    setShowingAll(!showingAll);
  };

  const totalScore = filteredCandidates.reduce((sum, c) => sum + c.matchScore, 0);
  const avgScore = filteredCandidates.length > 0 ? Math.round(totalScore / filteredCandidates.length) : 0;
  const topCandidates = filteredCandidates.filter(c => c.matchScore >= 85);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-500';
    if (score >= 80) return 'from-blue-500 to-cyan-500';
    if (score >= 70) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getScoreText = (score: number) => {
    if (score >= 90) return 'Excellent Match';
    if (score >= 80) return 'Good Match';
    if (score >= 70) return 'Fair Match';
    return 'Poor Match';
  };

  return (
    <div className="min-h-screen py-4 md:py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 px-3 py-2 md:px-4 md:py-2 rounded-full mb-4 md:mb-6">
              <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              <span className="text-green-800 font-semibold text-sm md:text-base">Step 3 of 3 - Complete</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
              Screening
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent block md:inline"> Results</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              AI-powered candidate analysis and ranking for {jobRequirement?.title || 'your position'}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8 md:mb-12 mx-4 md:mx-0">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full w-full transition-all duration-500"></div>
            </div>
            <div className="text-center text-sm text-gray-500 mt-2">Screening Complete ✓</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12 mx-4 md:mx-0">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-center shadow-lg border border-gray-100/50">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
                <Users size={24} />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{candidates.length}</div>
              <div className="text-gray-600 text-sm font-medium">Total Resumes</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-center shadow-lg border border-gray-100/50">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
                <Filter size={24} />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{filteredCandidates.length}</div>
              <div className="text-gray-600 text-sm font-medium">Filtered Results</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-center shadow-lg border border-gray-100/50">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
                <TrendingUp size={24} />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{avgScore}%</div>
              <div className="text-gray-600 text-sm font-medium">Average Score</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 text-center shadow-lg border border-gray-100/50">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
                <Star size={24} />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{topCandidates.length}</div>
              <div className="text-gray-600 text-sm font-medium">Top Matches</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 md:p-8 shadow-xl border border-gray-100/50 mb-6 md:mb-8 mx-4 md:mx-0">
            <h3 className="text-xl font-bold text-gray-900 mb-4 md:mb-6">Filter Candidates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                >
                  <option value="">All Categories</option>
                  <option value="Tech">Tech</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Operations">Operations</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Legal">Legal</option>
                  <option value="Project Management">Project Management</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Min Score</label>
                <input
                  type="number"
                  name="minScore"
                  value={filters.minScore}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Score</label>
                <input
                  type="number"
                  name="maxScore"
                  value={filters.maxScore}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Show Top</label>
                <input
                  type="number"
                  name="showTop"
                  value={filters.showTop}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                  min="1"
                  max="100"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={applyFilters}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                <Filter size={16} />
                Apply Filters
              </button>
              <button
                onClick={() => setFilters({ category: '', minScore: 0, maxScore: 100, showTop: 10 })}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-6 md:mb-8 mx-4 md:mx-0">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 px-4 md:px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Upload</span>
              <span className="sm:hidden">Back</span>
            </button>
            {candidates.length > filters.showTop && (
              <button
                onClick={toggleShowAll}
                className="flex items-center gap-2 px-4 md:px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-semibold"
              >
                <Users size={16} />
                {showingAll ? `Show Top ${filters.showTop}` : `Show All (${candidates.length})`}
              </button>
            )}
            <button
              onClick={downloadAllFiltered}
              className="flex items-center gap-2 px-4 md:px-6 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors font-semibold"
            >
              <FileDown size={16} />
              <span className="hidden sm:inline">Download Filtered ({filteredCandidates.length})</span>
              <span className="sm:hidden">Filtered ({filteredCandidates.length})</span>
            </button>
            <button
              onClick={downloadAllResumes}
              className="flex items-center gap-2 px-4 md:px-6 py-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors font-semibold"
            >
              <Archive size={16} />
              <span className="hidden sm:inline">All Resumes ({candidates.length})</span>
              <span className="sm:hidden">All ({candidates.length})</span>
            </button>
            <button
              onClick={restartProcess}
              className="flex items-center gap-2 px-4 md:px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              <RotateCcw size={16} />
              New Screening
            </button>
          </div>

          {/* Candidates Grid */}
          {filteredCandidates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mx-4 md:mx-0">
              {filteredCandidates.map((candidate, index) => (
                <div key={candidate.id} className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:transform hover:scale-105 border border-gray-100/50 relative">
                  {/* Rank Badge */}
                  {index < 3 && (
                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                        'bg-gradient-to-r from-orange-400 to-orange-600'
                      }`}>
                      {index + 1}
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 shadow-lg">
                      {candidate.filename.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                      {candidate.filename.split('.')[0]}
                    </h3>
                    <div className="text-sm text-gray-500 mb-3">
                      {candidate.category} • {candidate.experience} Level
                    </div>
                  </div>

                  {/* Match Score */}
                  <div className="mb-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-white font-bold text-sm shadow-lg bg-gradient-to-r ${getScoreColor(candidate.matchScore)}`}>
                      <Star size={14} />
                      {candidate.matchScore}% Match
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{getScoreText(candidate.matchScore)}</div>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Matched Skills:</div>
                    <div className="flex flex-wrap gap-1">
                      {candidate.matchedSkills && Array.isArray(candidate.matchedSkills) && candidate.matchedSkills.slice(0, 3).map((skill, skillIndex) => (
                        <span key={skillIndex} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                      {candidate.matchedSkills && candidate.matchedSkills.length > 3 && (
                        <span className="text-xs text-gray-500">+{candidate.matchedSkills.length - 3}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewResume(candidate)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-semibold text-sm"
                      title="View Resume"
                    >
                      <Eye size={14} />
                      <span className="hidden sm:inline">View</span>
                    </button>
                    <button
                      onClick={() => downloadResume(candidate)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors font-semibold text-sm"
                      title="Download Resume"
                    >
                      <Download size={14} />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 mx-4 md:mx-0">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={32} className="text-gray-400" />
              </div>
              <div className="text-gray-500 text-xl mb-4">No candidates match your current filters</div>
              <button
                onClick={() => setFilters({ category: '', minScore: 0, maxScore: 100, showTop: 10 })}
                className="px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-semibold"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Download Summary */}
          {(filteredCandidates.length > 0 || candidates.length > 0) && (
            <div className="mt-8 md:mt-12 mx-4 md:mx-0">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6 md:p-8 border border-blue-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                  <Archive className="w-6 h-6 text-blue-600" />
                  Download Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm md:text-base">
                  <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm">
                    <span className="text-gray-700 font-medium">Filtered Results:</span>
                    <span className="font-bold text-blue-600">{filteredCandidates.length} resumes</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm">
                    <span className="text-gray-700 font-medium">All Screened:</span>
                    <span className="font-bold text-purple-600">{candidates.length} resumes</span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-white/50 rounded-xl">
                  <div className="text-sm text-gray-600">
                    💡 <strong>Tip:</strong> Use "Download Filtered" to get only the candidates that match your criteria,
                    or "Download All Resumes\" to get the complete collection for future reference.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateResults;