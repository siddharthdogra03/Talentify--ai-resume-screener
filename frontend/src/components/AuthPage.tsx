import React, { useState } from 'react';
import { 
  FileText, Mail, Lock, User, Eye, EyeOff, ArrowLeft, Shield, 
  CheckCircle, AlertCircle, Sparkles, Zap, Key
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authAPI } from '../utils/api';

const AuthPage: React.FC = () => {
  const { setCurrentPage, setUser, setIsAuthenticated, setOtpAction } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    forgotEmail: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [otpType, setOtpType] = useState<'signup' | 'reset_password'>('signup');

  const passwordRequirements = [
    { text: 'At least 8 characters', check: (pwd: string) => pwd.length >= 8 },
    { text: 'One uppercase letter', check: (pwd: string) => /[A-Z]/.test(pwd) },
    { text: 'One lowercase letter', check: (pwd: string) => /[a-z]/.test(pwd) },
    { text: 'One number', check: (pwd: string) => /\d/.test(pwd) },
    { text: 'One special character', check: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isLogin) {
      const failedRequirements = passwordRequirements.filter(req => !req.check(formData.password));
      if (failedRequirements.length > 0) {
        newErrors.password = 'Password does not meet all requirements';
      }
    }

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordReset = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const failedRequirements = passwordRequirements.filter(req => !req.check(formData.newPassword));
      if (failedRequirements.length > 0) {
        newErrors.newPassword = 'Password does not meet all requirements';
      }
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (isLogin) {
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });

        if (response.token) {
          localStorage.setItem('epochfolio_token', response.token);
        }

        const userData = {
          id: response.user_id,
          user_id: response.user_id,
          email: response.email,
          name: response.name,
          role: response.role,
          hrId: response.hr_id,
          department: response.department,
          position: response.position
        };
        
        setUser(userData);
        localStorage.setItem('epochfolio_user', JSON.stringify(userData));
        setIsAuthenticated(true);
        
        if (response.role_set) {
          setCurrentPage('dashboard');
        } else {
          setCurrentPage('userInfo');
        }
      } else {
        const response = await authAPI.signup({
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });
        
        setPendingUser({
          email: formData.email,
          user_id: response.user_id
        });
        setOtpSent(true);
        setOtpType('signup');
        setErrors({});
      }
    } catch (error: any) {
      setErrors({ 
        email: error.message || 'An error occurred. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.verifyOTP({
        email: otpType === 'signup' ? pendingUser?.email : resetEmail,
        otp,
        action: otpType
      });
      
      if (otpType === 'signup') {
        const userData = {
          id: response.user_id,
          user_id: response.user_id,
          email: response.email,
          name: response.name,
          role: response.role,
          hrId: response.hr_id,
          department: response.department,
          position: response.position
        };
        
        setUser(userData);
        localStorage.setItem('epochfolio_user', JSON.stringify(userData));
        
        if (response.role_set) {
          setIsAuthenticated(true);
          setCurrentPage('dashboard');
        } else {
          setCurrentPage('userInfo');
        }
        
        setOtpSent(false);
        setPendingUser(null);
        setOtp('');
      } else if (otpType === 'reset_password') {
        setOtpSent(false);
        setShowPasswordReset(true);
        setOtp('');
      }
    } catch (error: any) {
      setErrors({ otp: error.message || 'Verification failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.forgotEmail) {
      setErrors({ forgotEmail: 'Email is required' });
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.forgotPassword(formData.forgotEmail);
      
      setResetEmail(formData.forgotEmail);
      setOtpAction('reset_password');
      setOtpSent(true);
      setOtpType('reset_password');
      setShowForgotPassword(false);
      setErrors({});
    } catch (error: any) {
      setErrors({ forgotEmail: error.message || 'Failed to send OTP. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordReset()) return;

    setIsLoading(true);
    try {
      await authAPI.resetPassword({
        email: resetEmail,
        new_password: formData.newPassword
      });
      
      setShowPasswordReset(false);
      setResetEmail('');
      setFormData({
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        forgotEmail: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      setErrors({});
      setIsLogin(true);
    } catch (error: any) {
      setErrors({ newPassword: error.message || 'Failed to reset password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({ 
      email: '', 
      phone: '',
      password: '', 
      confirmPassword: '', 
      forgotEmail: '',
      newPassword: '',
      confirmNewPassword: ''
    });
    setErrors({});
    setOtpSent(false);
    setOtp('');
    setPendingUser(null);
    setShowForgotPassword(false);
    setShowPasswordReset(false);
  };

  const resetAllStates = () => {
    setOtpSent(false);
    setPendingUser(null);
    setOtp('');
    setShowForgotPassword(false);
    setShowPasswordReset(false);
    setResetEmail('');
    setErrors({});
  };

  const benefits = [
    { icon: <Zap className="w-5 h-5" />, text: "Process 1000+ resumes in seconds" },
    { icon: <Shield className="w-5 h-5" />, text: "99.7% AI accuracy guarantee" },
    { icon: <Sparkles className="w-5 h-5" />, text: "Eliminate hiring bias completely" }
  ];

  // Password Reset Form (after OTP verification)
  if (showPasswordReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200/50 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentPage('landing')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors group"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText size={24} className="text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Talentify
                  </span>
                  <div className="text-xs text-gray-500 font-medium">AI-Powered Hiring</div>
                </div>
              </div>
              <div className="w-24"></div>
            </div>
          </div>
        </nav>

        <div className="pt-24 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100/50">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Lock size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Set New Password</h2>
                <p className="text-gray-600">
                  Create a new password for <br />
                  <span className="font-semibold text-blue-600">{resetEmail}</span>
                </p>
              </div>

              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Lock size={16} className="inline mr-2" />
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all duration-200 ${
                        errors.newPassword 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                      } focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  {formData.newPassword && (
                    <div className="mt-3 space-y-2">
                      {passwordRequirements.map((req, index) => {
                        const isValid = req.check(formData.newPassword);
                        return (
                          <div key={index} className={`flex items-center gap-2 text-sm ${
                            isValid ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            <CheckCircle size={16} className={isValid ? 'text-green-500' : 'text-gray-300'} />
                            {req.text}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {errors.newPassword && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      {errors.newPassword}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Lock size={16} className="inline mr-2" />
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmNewPassword"
                      value={formData.confirmNewPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all duration-200 ${
                        errors.confirmNewPassword 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                      } focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmNewPassword && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      {errors.confirmNewPassword}
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Resetting Password...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={resetAllStates}
                  className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // OTP Verification Form
  if (otpSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200/50 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentPage('landing')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors group"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText size={24} className="text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Talentify
                  </span>
                  <div className="text-xs text-gray-500 font-medium">AI-Powered Hiring</div>
                </div>
              </div>
              <div className="w-24"></div>
            </div>
          </div>
        </nav>

        <div className="pt-24 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100/50">
              <div className="text-center mb-8">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
                  otpType === 'signup' 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                    : 'bg-gradient-to-br from-orange-500 to-red-500'
                }`}>
                  {otpType === 'signup' ? <Mail size={32} className="text-white" /> : <Key size={32} className="text-white" />}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {otpType === 'signup' ? 'Verify Your Email' : 'Verify Password Reset'}
                </h2>
                <p className="text-gray-600">
                  We've sent a 6-digit code to <br />
                  <span className="font-semibold text-blue-600">
                    {otpType === 'signup' ? pendingUser?.email : resetEmail}
                  </span>
                </p>
              </div>

              <form onSubmit={handleOtpVerification} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail size={16} className="inline mr-2" />
                    Enter OTP Code
                  </label>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 text-center text-2xl tracking-widest ${
                      errors.otp 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-blue-500'
                    } focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
                    placeholder="000000"
                    maxLength={6}
                  />
                  {errors.otp && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      {errors.otp}
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || otp.length !== 6}
                  className={`w-full text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                    otpType === 'signup'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Verifying...
                    </div>
                  ) : (
                    otpType === 'signup' ? 'Verify & Continue' : 'Verify & Reset Password'
                  )}
                </button>
              </form>

              <div className="text-center mt-6">
                <p className="text-gray-600 text-sm">
                  Didn't receive the code?
                  <button
                    type="button"
                    onClick={() => {
                      if (otpType === 'signup') {
                        handleSubmit(new Event('submit') as any);
                      } else {
                        handleForgotPassword(new Event('submit') as any);
                      }
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    Resend
                  </button>
                </p>
                <button
                  type="button"
                  onClick={resetAllStates}
                  className="mt-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
                >
                  {otpType === 'signup' ? 'Back to signup' : 'Back to sign in'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Forgot Password Form
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200/50 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentPage('landing')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors group"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText size={24} className="text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Talentify
                  </span>
                  <div className="text-xs text-gray-500 font-medium">AI-Powered Hiring</div>
                </div>
              </div>
              <div className="w-24"></div>
            </div>
          </div>
        </nav>

        <div className="pt-24 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100/50">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Key size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
                <p className="text-gray-600">
                  Enter your email address and we'll send you an OTP to reset your password
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail size={16} className="inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="forgotEmail"
                    value={formData.forgotEmail}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                      errors.forgotEmail 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-blue-500'
                    } focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
                    placeholder="Enter your email address"
                  />
                  {errors.forgotEmail && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      {errors.forgotEmail}
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold py-4 px-6 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending OTP...
                    </div>
                  ) : (
                    'Send OTP for Password Reset'
                  )}
                </button>
              </form>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200/50 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentPage('landing')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText size={24} className="text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Talentify
                </span>
                <div className="text-xs text-gray-500 font-medium">AI-Powered Hiring</div>
              </div>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      <div className="pt-24 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="hidden lg:block">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-semibold">Join 2,500+ Companies</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Start Hiring
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                  Smarter Today
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Transform your recruitment process with AI that screens resumes 95% faster 
                and finds perfect candidates with unprecedented accuracy.
              </p>

              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                      {benefit.icon}
                    </div>
                    <span className="text-gray-700 font-medium">{benefit.text}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <div className="text-sm text-gray-600 mb-3">Trusted by industry leaders:</div>
                <div className="flex flex-wrap gap-4 text-gray-400 font-semibold">
                  <span>Microsoft</span>
                  <span>Google</span>
                  <span>Amazon</span>
                  <span>Meta</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100/50">
              
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FileText size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isLogin ? 'Welcome Back!' : 'Create Your Account'}
                </h2>
                <p className="text-gray-600">
                  {isLogin 
                    ? 'Sign in to continue your hiring journey' 
                    : 'Join thousands of companies hiring smarter'
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail size={16} className="inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                      errors.email 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-blue-500'
                    } focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      {errors.email}
                    </div>
                  )}
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="Enter your phone number"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Lock size={16} className="inline mr-2" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all duration-200 ${
                        errors.password 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                      } focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  {!isLogin && formData.password && (
                    <div className="mt-3 space-y-2">
                      {passwordRequirements.map((req, index) => {
                        const isValid = req.check(formData.password);
                        return (
                          <div key={index} className={`flex items-center gap-2 text-sm ${
                            isValid ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            <CheckCircle size={16} className={isValid ? 'text-green-500' : 'text-gray-300'} />
                            {req.text}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {errors.password && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                      <AlertCircle size={16} />
                      {errors.password}
                    </div>
                  )}
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Lock size={16} className="inline mr-2" />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all duration-200 ${
                          errors.confirmPassword 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-200 focus:border-blue-500'
                        } focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                        <AlertCircle size={16} />
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>
                )}

                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {isLogin ? 'Signing In...' : 'Creating Account...'}
                    </div>
                  ) : (
                    isLogin ? 'Sign In to Dashboard' : 'Create Account & Get OTP'
                  )}
                </button>
              </form>

              <div className="text-center mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-600">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    type="button"
                    onClick={toggleAuthMode}
                    className="ml-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    {isLogin ? 'Sign Up Free' : 'Sign In'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;