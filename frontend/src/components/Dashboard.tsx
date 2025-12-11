import React from 'react';
import { useApp } from '../context/AppContext';
import Header from './Header';
import JobSetup from './JobSetup';
import FileUpload from './FileUpload';
import CandidateResults from './CandidateResults';

const Dashboard: React.FC = () => {
  const { currentStep } = useApp();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <JobSetup />;
      case 1:
        return <FileUpload />;
      case 2:
        return <CandidateResults />;
      default:
        return <JobSetup />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      <div className="pt-20">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default Dashboard;