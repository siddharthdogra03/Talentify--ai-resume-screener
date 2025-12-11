import React, { useState } from 'react';
import { FileText, ArrowLeft, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { validatePassword, updatePasswordRequirements } from '../utils/validation';
import { API_BASE_URL } from '../utils/api';

const SignUp: React.FC = () => {
  const { goToPage, setCurrentUser, setOtpAction, setLoading, setLoadingMessage } = useApp();
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    capital: false,
    small: false,
    number: false,
    symbol: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Update password requirements in real-time
    if (name === 'password') {
      setPasswordRequirements(updatePasswordRequirements(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({ email: '', phone: '', password: '', confirmPassword: '' });

    // Validation
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return;
    }
    
    if (!formData.password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return;
    }
    
    if (!validatePassword(formData.password)) {
      setErrors(prev => ({ ...prev, password: 'Password does not meet all requirements' }));
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return;
    }

    setLoading(true);
    setLoadingMessage('Creating account and sending OTP...');

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setErrors(prev => ({ ...prev, email: data.message || 'Signup failed' }));
        return;
      }

      alert(data.message);
      setCurrentUser({
        email: formData.email,
        user_id: data.user_id,
        name: formData.email.split('@')[0]
      });
      setOtpAction('signup');
      goToPage('otpVerification');

    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred during signup. Please try again.');
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

        <h2 className="text-xl font-semibold text-center mb-6">Create Account</h2>

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
            <label className="form-label">Phone Number (Optional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your phone number"
            />
            {errors.phone && <div className="error-message">{errors.phone}</div>}
          </div>

          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Create a password"
            />
            <ul className="password-requirements">
              <li className={passwordRequirements.length ? 'satisfied' : ''}>
                At least 8 characters
              </li>
              <li className={passwordRequirements.capital ? 'satisfied' : ''}>
                At least one capital letter
              </li>
              <li className={passwordRequirements.small ? 'satisfied' : ''}>
                At least one small letter
              </li>
              <li className={passwordRequirements.number ? 'satisfied' : ''}>
                At least one number
              </li>
              <li className={passwordRequirements.symbol ? 'satisfied' : ''}>
                At least one special symbol
              </li>
            </ul>
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <div>
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => goToPage('auth')}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;