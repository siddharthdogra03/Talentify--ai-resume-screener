import React, { useState } from 'react';
import { FileText, ArrowLeft, Key } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { validatePassword, updatePasswordRequirements } from '../utils/validation';
import { API_BASE_URL } from '../utils/api';

const PasswordReset: React.FC = () => {
  const { 
    goToPage, 
    currentUser, 
    clearUserSession, 
    setLoading, 
    setLoadingMessage 
  } = useApp();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmNewPassword: ''
  });
  
  const [errors, setErrors] = useState({
    newPassword: '',
    confirmNewPassword: ''
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
    if (name === 'newPassword') {
      setPasswordRequirements(updatePasswordRequirements(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({ newPassword: '', confirmNewPassword: '' });

    if (!formData.newPassword) {
      setErrors(prev => ({ ...prev, newPassword: 'New password is required.' }));
      return;
    }
    
    if (!validatePassword(formData.newPassword)) {
      setErrors(prev => ({ ...prev, newPassword: 'New password does not meet all requirements.' }));
      return;
    }
    
    if (formData.newPassword !== formData.confirmNewPassword) {
      setErrors(prev => ({ ...prev, confirmNewPassword: 'Passwords do not match.' }));
      return;
    }

    setLoading(true);
    setLoadingMessage('Resetting password...');

    try {
      const response = await fetch(`${API_BASE_URL}/reset_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser?.email,
          new_password: formData.newPassword
        })
      });
      
      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        clearUserSession();
        goToPage('signin');
      } else {
        alert(`Error resetting password: ${data.message}`);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      alert('An error occurred during password reset. Please try again.');
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

        <h2 className="text-xl font-semibold text-center mb-4">Reset Password</h2>
        
        <p className="text-center text-gray-600 mb-6">
          Enter your new password for <span className="font-semibold">{currentUser?.email}</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter new password"
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
            {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
          </div>

          <div>
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Confirm new password"
            />
            {errors.confirmNewPassword && <div className="error-message">{errors.confirmNewPassword}</div>}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => goToPage('signin')}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Key size={20} />
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordReset;