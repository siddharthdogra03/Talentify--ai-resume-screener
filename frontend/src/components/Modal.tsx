import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Modal: React.FC = () => {
  const { showModal, setShowModal, modalData, logout, setCurrentStep } = useApp();

  if (!showModal) return null;

  const handleClose = () => {
    setShowModal(null);
  };

  const handleLogout = () => {
    logout();
    setShowModal(null);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setShowModal(null);
  };

  const renderModalContent = () => {
    switch (showModal) {
      case 'logout':
        return (
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Confirm Logout</h3>
              <button onClick={handleClose} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle size={24} className="text-amber-500" />
                <p>Are you sure you want to logout? Any unsaved progress will be lost.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleClose} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleLogout} className="btn btn-danger">
                Logout
              </button>
            </div>
          </div>
        );

      case 'restart':
        return (
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Start New Screening</h3>
              <button onClick={handleClose} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle size={24} className="text-amber-500" />
                <p>This will clear all current data and start a new screening process. Continue?</p>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleClose} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleRestart} className="btn btn-primary">
                Start New
              </button>
            </div>
          </div>
        );

      case 'resume':
        return (
          <div className="modal-content modal-content-large">
            <div className="modal-header">
              <h3 className="modal-title">{modalData?.title}</h3>
              <button onClick={handleClose} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                  {modalData?.content}
                </pre>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleClose} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div onClick={(e) => e.stopPropagation()}>
        {renderModalContent()}
      </div>
    </div>
  );
};

export default Modal;