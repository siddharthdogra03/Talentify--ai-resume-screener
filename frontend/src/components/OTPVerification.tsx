import React, { useState } from 'react';
import { FileText, ArrowLeft, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../utils/api';

const OTPVerification: React.FC = () => {
  const {
    goToPage,
    currentUser,
    setCurrentUser,
    saveSession,
    otpAction,
    setOtpAction,
    setLoading,
    setLoadingMessage
  } = useApp();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }

    setLoading(true);
    setLoadingMessage('Verifying OTP...');

    try {
      const response = await fetch(`${API_BASE_URL}/verify_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser?.email,
          otp,
          action: otpAction
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);

        if (otpAction === 'signup') {
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
          saveSession(user);

          if (data.role_set) {
            goToPage('jobDescription');
          } else {
            goToPage('hrInfo');
          }
        } else if (otpAction === 'reset_password') {
          goToPage('resetPassword');
        }

        setOtpAction(null);
      } else {
        setError(data.message || 'OTP verification failed.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      alert('An error occurred during OTP verification. Please try again.');
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

        <h2 className="text-xl font-semibold text-center mb-4">Verify OTP</h2>

        <p className="text-center text-gray-600 mb-6">
          An OTP has been sent to <span className="font-semibold">{currentUser?.email}</span>.
          Please enter it below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="form-input text-center text-lg tracking-widest"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
            />
            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => goToPage('signin')}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back to Sign In
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Shield size={20} />
              Verify OTP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification;