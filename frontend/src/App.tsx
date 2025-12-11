import React from 'react';
import { AppProvider } from './context/AppContext';
import AppRouter from './components/AppRouter';
import './App.css';

function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

export default App;