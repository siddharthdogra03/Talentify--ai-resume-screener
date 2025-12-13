import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

import { API_BASE_URL } from '../utils/api';

const ResumeViewModal: React.FC = () => {
  const { showResumeModal, setShowResumeModal, resumeModalData } = useApp();
  console.log('ResumeViewModal data:', resumeModalData);

  console.log('ResumeViewModal data:', resumeModalData);

  if (!showResumeModal) return null;

  const hasPdfExtension = (name: string) => name && name.toLowerCase().endsWith('.pdf');
  const isPdf = hasPdfExtension(resumeModalData.title) ||
    hasPdfExtension(resumeModalData.filename) ||
    hasPdfExtension(resumeModalData.filepath);

  const resumeUrl = resumeModalData.id ? `${API_BASE_URL}/resume_file/${resumeModalData.id}` : '';

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] h-[90vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
          <h3 className="text-xl font-semibold text-gray-800">{resumeModalData.title}</h3>
          <button
            onClick={() => setShowResumeModal(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden bg-gray-50 rounded-lg relative">
          {isPdf && resumeUrl ? (
            <iframe
              src={resumeUrl}
              className="w-full h-full border-none"
              title="Resume Preview"
            />
          ) : (
            <div className="w-full h-full overflow-y-auto p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-700">
                {resumeModalData.content}
              </pre>
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default ResumeViewModal;