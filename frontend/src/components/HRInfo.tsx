import React, { useState, useEffect } from 'react';
import { FileText, ArrowLeft, ArrowRight, User, Building, Briefcase, Car as IdCard, Shield, CheckCircle, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';


const HRInfo: React.FC = () => {
  const { 
    setCurrentPage, 
    user, 
    setUser,
    setIsAuthenticated
  } = useApp();
  
  const [formData, setFormData] = useState({
    hrName: '',
    hrId: '',
    position: '',
    department: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill form with existing user data
  useEffect(() => {
    if (user) {
      setFormData({
        hrName: user.name || '',
        hrId: user.hrId || '',
        position: user.position || '',
        department: user.department || ''
      });
    }
  }, [user]);

  const departments = [
    { value: 'Human Resources', icon: '👥', color: 'from-blue-500 to-cyan-500' },
    { value: 'Information Technology', icon: '💻', color: 'from-purple-500 to-pink-500' },
    { value: 'Finance', icon: '💰', color: 'from-green-500 to-emerald-500' },
    { value: 'Marketing', icon: '📢', color: 'from-orange-500 to-red-500' },
    { value: 'Operations', icon: '⚙️', color: 'from-indigo-500 to-purple-500' },
    { value: 'Sales', icon: '📈', color: 'from-teal-500 to-blue-500' },
    { value: 'Product', icon: '🚀', color: 'from-pink-500 to-rose-500' },
    { value: 'Design', icon: '🎨', color: 'from-violet-500 to-purple-500' },
    { value: 'Legal', icon: '⚖️', color: 'from-gray-500 to-slate-500' },
    { value: 'Other', icon: '📋', color: 'from-amber-500 to-yellow-500' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.hrName.trim()) {
      newErrors.hrName = 'Full name is required';
    }
    if (!formData.hrId.trim()) {
      newErrors.hrId = 'HR ID is required';
    }
    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }
    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Update user object with new HR info
    const updatedUser = {
      ...user,
      name: formData.hrName,
      hrId: formData.hrId,
      position: formData.position,
      department: formData.department
    };

    setUser(updatedUser);
    localStorage.setItem('epochfolio_user', JSON.stringify(updatedUser));
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const selectedDepartment = departments.find(dept => dept.value === formData.department);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="pt-24 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 md:p-10 shadow-2xl border border-gray-100/50">
            
            {/* Header */}
            <div className="text-center mb-8 md:mb-12">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <User size={40} className="text-white md:w-12 md:h-12" />
              </div>
              <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full mb-4">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800 font-semibold text-sm">Complete Your Profile</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Tell Us About
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block md:inline"> Yourself</span>
              </h1>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                Help us personalize your hiring experience with some basic information
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8 md:mb-12">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <span className="text-sm font-medium text-gray-700">of 3 steps</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full w-2/3 transition-all duration-500"></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              
              {/* Full Name */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <User size={16} className="inline mr-2 text-blue-600" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="hrName"
                  value={formData.hrName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-200 ${
                    errors.hrName 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-blue-500 group-hover:border-gray-300'
                  } focus:outline-none focus:ring-4 focus:ring-blue-500/20 text-lg`}
                  placeholder="Enter your full name"
                />
                {errors.hrName && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
                    {errors.hrName}
                  </div>
                )}
              </div>

              {/* HR ID */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <IdCard size={16} className="inline mr-2 text-purple-600" />
                  HR ID / Employee ID
                </label>
                <input
                  type="text"
                  name="hrId"
                  value={formData.hrId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-200 ${
                    errors.hrId 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-blue-500 group-hover:border-gray-300'
                  } focus:outline-none focus:ring-4 focus:ring-blue-500/20 text-lg`}
                  placeholder="Enter your HR or Employee ID"
                />
                {errors.hrId && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
                    {errors.hrId}
                  </div>
                )}
              </div>

              {/* Position */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Briefcase size={16} className="inline mr-2 text-green-600" />
                  Position / Job Title
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-200 ${
                    errors.position 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-blue-500 group-hover:border-gray-300'
                  } focus:outline-none focus:ring-4 focus:ring-blue-500/20 text-lg`}
                  placeholder="e.g., Senior HR Manager, Talent Acquisition Lead"
                />
                {errors.position && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
                    {errors.position}
                  </div>
                )}
              </div>

              {/* Department */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Building size={16} className="inline mr-2 text-orange-600" />
                  Department
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {departments.map((dept) => (
                    <button
                      key={dept.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, department: dept.value }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left group/dept ${
                        formData.department === dept.value
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${dept.color} flex items-center justify-center text-white text-lg shadow-md group-hover/dept:scale-110 transition-transform`}>
                          {dept.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{dept.value}</div>
                          {formData.department === dept.value && (
                            <div className="flex items-center gap-1 text-blue-600 text-sm mt-1">
                              <CheckCircle size={14} />
                              Selected
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.department && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                    <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-xs">!</span>
                    {errors.department}
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <button
                  type="button"
                  onClick={() => setCurrentPage('auth')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold order-2 sm:order-1"
                >
                  <ArrowLeft size={20} />
                  <span className="hidden sm:inline">Back to Sign In</span>
                  <span className="sm:hidden">Back</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl order-1 sm:order-2"
                >
                  Continue to Dashboard
                  <ArrowRight size={20} />
                </button>
              </div>
            </form>

            {/* User Info Display */}
            {user?.email && (
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm font-semibold text-blue-800">Account Information</div>
                    <div className="text-sm text-blue-700">{user.email}</div>
                    {user.phone && (
                      <div className="text-sm text-blue-700">{user.phone}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Selected Department Preview */}
            {selectedDepartment && (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedDepartment.color} flex items-center justify-center text-white shadow-md`}>
                    {selectedDepartment.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-green-800">Selected Department</div>
                    <div className="text-sm text-green-700">{selectedDepartment.value}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRInfo;