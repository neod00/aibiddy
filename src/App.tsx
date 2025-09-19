import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { ConditionProvider } from './contexts/ConditionContext';
import { SummaryProvider } from './contexts/SummaryContext';
import { BidProvider } from './contexts/BidContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import { initGA } from './utils/analytics';
import HomePage from './pages/HomePage';
import BidDetailPage from './pages/BidDetailPage';
import PricingPage from './pages/PricingPage';
import AppLayout from './components/AppLayout';

function AppContent() {
  useEffect(() => {
    // Google Analytics 초기화
    initGA();
  }, []);

  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/bid/:bidId" element={<BidDetailPage />} />
          <Route path="/pricing" element={<PricingPage />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ConditionProvider>
            <SummaryProvider>
              <BidProvider>
                <AppContent />
              </BidProvider>
            </SummaryProvider>
          </ConditionProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;