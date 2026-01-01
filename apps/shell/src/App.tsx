import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Header from './components/Header';

const WorkoutApp = React.lazy(() => import('workout/App'));
const FoodApp = React.lazy(() => import('food/App'));
const AnalyticsApp = React.lazy(() => import('analytics/App'));

function App() {
  const preferences = useSelector((state: RootState) => state.preferences);

  return (
    <div className={`app theme-${preferences.theme}`}>
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route
            path="/workout/*"
            element={
              <Suspense fallback={<div className="loading">Loading Workout...</div>}>
                <WorkoutApp />
              </Suspense>
            }
          />
          <Route
            path="/food/*"
            element={
              <Suspense fallback={<div className="loading">Loading Food...</div>}>
                <FoodApp />
              </Suspense>
            }
          />
          <Route
            path="/analytics/*"
            element={
              <Suspense fallback={<div className="loading">Loading Analytics...</div>}>
                <AnalyticsApp />
              </Suspense>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function Home() {
  return (
    <div className="home">
      <h1>Welcome to FitLog 🏋️</h1>
      <p>Your fitness tracking companion</p>
    </div>
  );
}

export default App;