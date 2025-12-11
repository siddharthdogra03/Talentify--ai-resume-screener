import React from 'react';
import { FileText, UserPlus, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';

const AuthChoice: React.FC = () => {
  const { goToPage } = useApp();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card max-w-md w-full text-center fade-in">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FileText size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Talentify
          </h1>
          <p className="text-gray-600 mb-2">Welcome Back</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Get Started</h2>
          <p className="text-gray-600">Choose an option to continue</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => goToPage('signup')}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <UserPlus size={20} />
            Sign Up
          </button>
          <button
            onClick={() => goToPage('signin')}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthChoice;