import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { ConditionProvider } from './contexts/ConditionContext';
import { SummaryProvider } from './contexts/SummaryContext';
import HomePage from './pages/HomePage';
import BidDetailPage from './pages/BidDetailPage';
import AppLayout from './components/AppLayout';

function AppContent() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/bid/:bidId" element={<BidDetailPage />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ConditionProvider>
        <SummaryProvider>
          <AppContent />
        </SummaryProvider>
      </ConditionProvider>
    </AuthProvider>
  );
}

export default App;