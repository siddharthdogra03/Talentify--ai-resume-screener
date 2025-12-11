import React, { useState } from 'react';
import { Briefcase, Plus, X, ArrowRight, ArrowLeft, Sparkles, Target, Users, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { jobAPI } from '../utils/api';

const JobSetup: React.FC = () => {
  const {
    setJobRequirement,
    setCurrentJobId,
    setCurrentStep,
    user,
    setLoading,
    setLoadingMessage
  } = useApp();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    experience: 'Any',
    department: user?.department || '',
    location: '',
    jobType: 'Full-time'
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const jobTemplates = [
    {
      title: 'Software Engineer',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
      experience: 'Mid',
      description: 'We are looking for a skilled Software Engineer to join our development team. You will be responsible for designing, developing, and maintaining web applications using modern technologies.'
    },
    {
      title: 'Product Manager',
      skills: ['Product Strategy', 'Agile', 'Analytics', 'User Research', 'Roadmapping'],
      experience: 'Senior',
      description: 'Seeking an experienced Product Manager to drive product strategy and execution. You will work closely with engineering, design, and business teams to deliver exceptional products.'
    },
    {
      title: 'Data Scientist',
      skills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'TensorFlow'],
      experience: 'Mid',
      description: 'Join our data team as a Data Scientist to extract insights from complex datasets. You will build predictive models and drive data-driven decision making across the organization.'
    },
    {
      title: 'UX Designer',
      skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Usability Testing'],
      experience: 'Mid',
      description: 'We need a creative UX Designer to craft intuitive user experiences. You will conduct user research, create wireframes, and collaborate with product teams to design user-centered solutions.'
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
      title: template.title,
      experience: template.experience,
      description: template.description
    }));
    setSkills(template.skills);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }
    if (skills.length === 0) {
      newErrors.skills = 'At least one skill is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!user?.user_id) {
      setErrors({ title: 'User session expired. Please login again.' });
      return;
    }

    setLoading(true);
    setLoadingMessage('Creating job requirements...');

    try {
      const payload = {
        user_id: user.user_id,
        job_title: formData.title,
        job_description: formData.description,
        department: formData.department,
        skills,
        experience_required: formData.experience,
        location: formData.location,
        job_type: formData.jobType
      };
      console.log('Sending job requirements payload:', payload);

      const response = await jobAPI.createJob(payload);

      const jobRequirement = {
        id: response.job_id,
        job_id: response.job_id,
        title: formData.title,
        description: formData.description,
        skills,
        experience: formData.experience,
        department: formData.department,
        location: formData.location,
        jobType: formData.jobType
      };

      setJobRequirement(jobRequirement);
      setCurrentJobId(response.job_id);
      setCurrentStep(1); // Move to next step (File Upload)
    } catch (error: any) {
      console.error('Job creation error:', error);
      setErrors({ title: error.message || 'Failed to create job requirements. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-4 md:py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 px-3 py-2 md:px-4 md:py-2 rounded-full mb-4 md:mb-6">
              <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              <span className="text-blue-800 font-semibold text-sm md:text-base">Step 1 of 3</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
              Define Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block md:inline"> Perfect Role</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Set up your job requirements and let our AI find the ideal candidates for your position
            </p>
          </div>

          {/* Quick Templates */}
          <div className="mb-8 md:mb-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 px-4 md:px-0">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Quick Start Templates
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 px-4 md:px-0">
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

          {/* Main Form */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-4 md:p-8 shadow-xl border border-gray-100/50 mx-4 md:mx-0">
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">

              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Target className="w-4 h-4 inline mr-2" />
                    Job Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${errors.title
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                      } focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
                    placeholder="e.g., Senior Software Engineer"
                  />
                  {errors.title && <div className="text-red-600 text-sm mt-1">{errors.title}</div>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder="e.g., San Francisco, Remote"
                  />
                </div>
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 min-h-32 ${errors.description
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                    } focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
                  placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                  rows={6}
                />
                {errors.description && <div className="text-red-600 text-sm mt-1">{errors.description}</div>}
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
                    className="px-4 md:px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
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

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Type
                  </label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder="Department"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    From your profile: {user?.department}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(-1)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold order-2 sm:order-1"
                >
                  <ArrowLeft size={20} />
                  <span className="hidden sm:inline">Back</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl order-1 sm:order-2"
                >
                  Continue to Upload Resumes
                  <ArrowRight size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSetup;