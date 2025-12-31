import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Header from './components/Header';

// Lazy load the remote MFE
const WorkoutApp = React.lazy(() => import('workout/App'));

function App() {
  const preferences = useSelector((state: RootState) => state.preferences);

  return (
    <div className={`app theme-${preferences.theme}`}>
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/workout/*"
            element={
              <Suspense fallback={<div className="loading">Loading Workout...</div>}>
                <WorkoutApp />
              </Suspense>
            }
          />
          <Route path="/food/*" element={<div>Food MFE will load here</div>} />
          <Route path="/analytics/*" element={<div>Analytics MFE will load here</div>} />
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