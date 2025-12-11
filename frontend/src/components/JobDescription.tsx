import React, { useState } from 'react';
import { FileText, ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../utils/api';

const JobDescription: React.FC = () => {
  const { 
    goToPage, 
    currentUser, 
    keywords, 
    setKeywords, 
    setCurrentJobId, 
    setLoading, 
    setLoadingMessage 
  } = useApp();
  
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobDesc: '',
    experience: 'Any'
  });
  
  const [keywordInput, setKeywordInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const addKeyword = () => {
    const keyword = keywordInput.trim();
    if (keyword && !keywords.includes(keyword)) {
      setKeywords([...keywords, keyword]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(k => k !== keywordToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.user_id) {
      alert('User not logged in. Please sign in first.');
      goToPage('signin');
      return;
    }

    if (!formData.jobTitle || !formData.jobDesc || keywords.length === 0) {
      alert('Please provide a Job Title, Job Description, and at least one keyword/skill.');
      return;
    }

    setLoading(true);
    setLoadingMessage('Saving job requirements...');

    try {
      const response = await fetch(`${API_BASE_URL}/job_requirements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.user_id,
          job_description: formData.jobDesc,
          department: currentUser.department,
          skills: keywords,
          experience_required: formData.experience
        })
      });
      
      const data = await response.json();

      if (response.ok) {
        setCurrentJobId(data.job_id);
        alert('Job requirements saved successfully!');
        goToPage('upload');
      } else {
        alert(`Error saving job requirements: ${data.message}`);
      }
    } catch (error) {
      console.error('Error saving job requirements:', error);
      alert('An error occurred while saving job requirements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card max-w-2xl w-full fade-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FileText size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Talentify</h1>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '40%' }}></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">Job Title</label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Senior Software Engineer"
              required
            />
          </div>

          <div>
            <label className="form-label">Job Description</label>
            <textarea
              name="jobDesc"
              value={formData.jobDesc}
              onChange={handleInputChange}
              className="form-input min-h-32 resize-y"
              placeholder="Paste or type the complete job description here..."
              required
            />
          </div>

          <div>
            <label className="form-label">Keywords/Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={handleKeywordKeyPress}
                className="form-input flex-1"
                placeholder="e.g., JavaScript, React, Node.js"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="btn-primary px-4 flex items-center gap-2"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
            
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {keywords.map((keyword, index) => (
                  <div key={index} className="tag">
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="tag-remove"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="form-label">Years of Experience Required</label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="Any">Any</option>
              <option value="0-2">0-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="6-10">6-10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => goToPage('hrInfo')}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              Next
              <ArrowRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobDescription;