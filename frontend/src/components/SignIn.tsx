import React, { useState } from 'react';
import { FileText, ArrowLeft, LogIn, Key } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../utils/api';

const SignIn: React.FC = () => {
  const {
    goToPage,
    setCurrentUser,
    saveSession,
    setOtpAction,
    setLoading,
    setLoadingMessage
  } = useApp();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({ email: '', password: '' });

    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: 'Please enter your email address' }));
      return;
    }

    if (!formData.password) {
      setErrors(prev => ({ ...prev, password: 'Please enter your password' }));
      return;
    }

    setLoading(true);
    setLoadingMessage('Signing in...');

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        const user = {
          email: data.email,
          id: data.user_id,
          user_id: data.user_id,
          name: data.name,
          role: data.role,
          hr_id: data.hr_id,
          department: data.department,
          position: data.position
        };

        setCurrentUser(user);
        setCurrentUser(user);
        saveSession(user);
        alert(data.message);

        if (data.role_set) {
          goToPage('jobDescription');
        } else {
          goToPage('hrInfo');
        }
      } else {
        setErrors(prev => ({ ...prev, email: data.message || 'Login failed' }));
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      alert('Please enter your email address to reset password.');
      return;
    }

    setLoading(true);
    setLoadingMessage('Sending OTP for password reset...');

    try {
      const response = await fetch(`${API_BASE_URL}/forgot_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentUser({
          email: formData.email,
          id: '',
          user_id: '',
          name: formData.email.split('@')[0]
        });
        setOtpAction('reset_password');
        goToPage('otpVerification');
        alert(data.message);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      alert('An error occurred. Please try again.');
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

        <h2 className="text-xl font-semibold text-center mb-6">Sign In</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your email address"
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your password"
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => goToPage('auth')}
                className="btn-secondary flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="btn-secondary flex items-center gap-2"
              >
                <Key size={20} />
                Forgot Password?
              </button>
            </div>
            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;