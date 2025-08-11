import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import HomePage from './pages/HomePage.tsx'
import TourneyPage from './pages/TourneyPage.tsx'
import LeaderboardPage from './pages/LeaderboardPage.tsx'
import LoginPage from './pages/LoginPage.tsx';

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '1rem' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/tourney/1" style={{ marginRight: '1rem' }}>Tourney Example (from DB)</Link>
        <Link to="/tourney/1234/round/1234/leaderboard" style={{ marginRight: '1rem' }}>Leaderboard Example (hard-coded)</Link>
        <Link to="/login">Login (will be secret path for beta)</Link>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tourney/:tourneyId" element={<TourneyPage />} />
        <Route path="/tourney/:tourneyId/round/:roundId/leaderboard" element={<LeaderboardPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
