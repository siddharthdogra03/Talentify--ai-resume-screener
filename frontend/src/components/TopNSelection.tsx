import React, { useState } from 'react';
import { FileText, ArrowLeft, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../utils/api';

const TopNSelection: React.FC = () => {
  const {
    goToPage,
    currentJobId,
    uploadedResumeIds,
    setCandidates,
    setLoading,
    setLoadingMessage
  } = useApp();

  const [formData, setFormData] = useState({
    topCandidates: 10,
    location: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'topCandidates' ? parseInt(value) || 10 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentJobId || uploadedResumeIds.length === 0) {
      alert('Please ensure job requirements are saved and resumes are uploaded.');
      return;
    }

    setLoading(true);
    setLoadingMessage('Screening resumes and calculating scores...');

    try {
      const payload = {
        job_id: currentJobId,
        resume_ids: uploadedResumeIds
      };
      console.log('Sending screening payload:', payload);

      const response = await fetch(`${API_BASE_URL}/screen_resumes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        const sortedCandidates = data.results.sort((a: any, b: any) => b.match_score - a.match_score);
        setCandidates(sortedCandidates);
        goToPage('dashboard');
      } else {
        alert(`Error screening resumes: ${data.message}`);
      }
    } catch (error) {
      console.error('Error screening resumes:', error);
      alert('An error occurred during resume screening. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card max-w-md w-full fade-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FileText size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Talentify</h1>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '80%' }}></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">Number of Top Candidates to Shortlist</label>
            <input
              type="number"
              name="topCandidates"
              value={formData.topCandidates}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., 10"
              min="1"
              max="100"
              required
            />
          </div>

          <div>
            <label className="form-label">Location Filter (Optional)</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., New York, Remote"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => goToPage('upload')}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Search size={20} />
              Process Resumes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TopNSelection;