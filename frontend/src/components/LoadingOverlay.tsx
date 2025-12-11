import React from 'react';
import { useApp } from '../context/AppContext';

const LoadingOverlay: React.FC = () => {
  const { loading, loadingMessage } = useApp();

  if (!loading) return null;

  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <div className="loading-text">{loadingMessage}</div>
    </div>
  );
};

export default LoadingOverlay;