import React from 'react';
import { useApp } from '../context/AppContext';
import LandingPage from './LandingPage';
import AuthPage from './AuthPage';
import UserInfoCollection from './UserInfoCollection';
import JobDescriptionPage from './JobDescriptionPage';
import Dashboard from './Dashboard';
import LoadingOverlay from './LoadingOverlay';
import Modal from './Modal';
import NotificationsPage from './NotificationsPage';
import AccountSettingsPage from './AccountSettingsPage';

const AppRouter: React.FC = () => {
  const { isAuthenticated, loading, showModal, currentPage } = useApp();

  // If user is authenticated, show dashboard or other authenticated pages
  if (isAuthenticated) {
    if (currentPage === 'notifications') {
      return (
        <>
          <NotificationsPage />
          {loading && <LoadingOverlay />}
          {showModal && <Modal />}
        </>
      );
    }

    if (currentPage === 'account') {
      return (
        <>
          <AccountSettingsPage />
          {loading && <LoadingOverlay />}
          {showModal && <Modal />}
        </>
      );
    }

    if (currentPage === 'profile') {
      return (
        <>
          <UserInfoCollection />
          {loading && <LoadingOverlay />}
          {showModal && <Modal />}
        </>
      );
    }

    return (
      <>
        <Dashboard />
        {loading && <LoadingOverlay />}
        {showModal && <Modal />}
      </>
    );
  }

  // If user is not authenticated, show landing or auth based on currentPage
  return (
    <>
      {currentPage === 'auth' && <AuthPage />}
      {currentPage === 'userInfo' && <UserInfoCollection />}
      {currentPage === 'jobDescription' && <JobDescriptionPage />}
      {currentPage === 'landing' && <LandingPage />}
      {loading && <LoadingOverlay />}
      {showModal && <Modal />}
    </>
  );
};

export default AppRouter;