import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workout/*" element={<div>Workout MFE will load here</div>} />
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
