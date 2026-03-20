import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import { ErrorBoundary } from '@fitlog/ui';
import { getDailySummary } from '@fitlog/api';
import { formatCalories } from '@fitlog/utils';
import Header from './components/Header';

const WorkoutApp = React.lazy(() => import('workout/App'));
const FoodApp = React.lazy(() => import('food/App'));
const AnalyticsApp = React.lazy(() => import('analytics/App'));

function LoadingFallback({ name }: { name: string }) {
  return (
    <div className="loading">
      <div className="loading-spinner" />
      <span>Loading {name}...</span>
    </div>
  );
}

function RemoteMFE({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <ErrorBoundary name={name}>
      <Suspense fallback={<LoadingFallback name={name} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

function Home() {
  const summary = getDailySummary();

  return (
    <div className="home">
      <h1 className="home-title">Today's summary</h1>
      <div className="home-grid">
        <div className="home-card">
          <span className="home-card-value">{summary.workoutCount}</span>
          <span className="home-card-label">workouts</span>
        </div>
        <div className="home-card">
          <span className="home-card-value home-card-burned">
            {formatCalories(summary.totalCaloriesBurned)}
          </span>
          <span className="home-card-label">burned</span>
        </div>
        <div className="home-card">
          <span className="home-card-value home-card-consumed">
            {formatCalories(summary.totalCaloriesConsumed)}
          </span>
          <span className="home-card-label">consumed</span>
        </div>
        <div className="home-card">
          <span className="home-card-value">
            {summary.totalProtein}g
          </span>
          <span className="home-card-label">protein</span>
        </div>
      </div>
      <p className="home-hint">
        Navigate to Workout or Food to log your activity.
      </p>
    </div>
  );
}

function App() {
  const preferences = useSelector((state: RootState) => state.preferences);

  return (
    <div className="app" data-theme={preferences.theme}>
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route
            path="/workout/*"
            element={<RemoteMFE name="Workout"><WorkoutApp /></RemoteMFE>}
          />
          <Route
            path="/food/*"
            element={<RemoteMFE name="Food"><FoodApp /></RemoteMFE>}
          />
          <Route
            path="/analytics/*"
            element={<RemoteMFE name="Analytics"><AnalyticsApp /></RemoteMFE>}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
