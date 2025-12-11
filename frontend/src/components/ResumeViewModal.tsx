import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ResumeViewModal: React.FC = () => {
  const { showResumeModal, setShowResumeModal, resumeModalData } = useApp();

  if (!showResumeModal) return null;

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h3 className="text-xl font-semibold text-gray-800">{resumeModalData.title}</h3>
          <button
            onClick={() => setShowResumeModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-700 bg-gray-50 p-4 rounded-lg">
            {resumeModalData.content}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ResumeViewModal;