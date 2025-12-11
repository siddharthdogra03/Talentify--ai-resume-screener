import React, { useState } from 'react';
import { FileText, Plus, X, ArrowRight, Target, Sparkles, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

const JobDescriptionPage: React.FC = () => {
  const { setCurrentPage, user, setJobRequirement, setCurrentStep } = useApp();
  
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobDescription: '',
    experience: 'Any'
  });
  
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const jobTemplates = [
    {
      title: 'Software Engineer',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
      experience: 'Mid'
    },
    {
      title: 'Product Manager',
      skills: ['Product Strategy', 'Agile', 'Analytics', 'User Research', 'Roadmapping'],
      experience: 'Senior'
    },
    {
      title: 'Data Scientist',
      skills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'TensorFlow'],
      experience: 'Mid'
    },
    {
      title: 'UX Designer',
      skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Usability Testing'],
      experience: 'Mid'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const applyTemplate = (template: typeof jobTemplates[0]) => {
    setFormData(prev => ({
      ...prev,
      jobTitle: template.title,
      experience: template.experience
    }));
    setSkills(template.skills);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }
    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = 'Job description is required';
    }
    if (skills.length === 0) {
      newErrors.skills = 'At least one skill is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const jobRequirement = {
      id: '1',
      title: formData.jobTitle,
      description: formData.jobDescription,
      skills,
      experience: formData.experience,
      department: user?.department || '',
      location: '',
      jobType: 'Full-time'
    };

    setJobRequirement(jobRequirement);
    setCurrentStep(1);
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="pt-24 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100/50">
            
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FileText size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Define Job Requirements</h2>
              <p className="text-gray-600">
                Set up your job requirements for AI-powered candidate screening
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-12">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  3
                </div>
                <span className="text-sm font-medium text-gray-700">of 3 steps</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-full transition-all duration-300"></div>
              </div>
            </div>

            {/* Quick Templates */}
            <div className="mb-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Quick Start Templates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {jobTemplates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => applyTemplate(template)}
                    className="p-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300 text-left group"
                  >
                    <div className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {template.title}
                    </div>
                    <div className="text-sm text-gray-500 mb-3">{template.experience} Level</div>
                    <div className="flex flex-wrap gap-1">
                      {template.skills.slice(0, 3).map((skill, skillIndex) => (
                        <span key={skillIndex} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                      {template.skills.length > 3 && (
                        <span className="text-xs text-gray-400">+{template.skills.length - 3}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Job Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Target className="w-4 h-4 inline mr-2" />
                  Job Title
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                    errors.jobTitle 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-blue-500'
                  } focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
                  placeholder="e.g., Senior Software Engineer"
                />
                {errors.jobTitle && <div className="text-red-600 text-sm mt-1">{errors.jobTitle}</div>}
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 min-h-32 ${
                    errors.jobDescription 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-blue-500'
                  } focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
                  placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                  rows={6}
                />
                {errors.jobDescription && <div className="text-red-600 text-sm mt-1">{errors.jobDescription}</div>}
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Required Skills & Technologies
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleSkillKeyPress}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-2 rounded-xl border border-blue-200"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.skills && <div className="text-red-600 text-sm">{errors.skills}</div>}
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Experience Level
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                >
                  <option value="Any">Any Experience</option>
                  <option value="Entry">Entry Level (0-2 years)</option>
                  <option value="Mid">Mid Level (3-5 years)</option>
                  <option value="Senior">Senior Level (6-10 years)</option>
                  <option value="Expert">Expert Level (10+ years)</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <button 
                  type="submit" 
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Start Resume Screening
                  <ArrowRight size={20} />
                </button>
              </div>
            </form>

            {/* User Info Display */}
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <div className="text-sm font-semibold text-gray-800 mb-2">Screening for: {user?.department} Department</div>
              <div className="text-xs text-gray-600">
                {user?.name} • {user?.position} • {user?.email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDescriptionPage;