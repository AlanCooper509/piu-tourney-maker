import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ChartsPage from './pages/ChartsPage.tsx'
import ChartPoolPage from './pages/ChartPoolPage.tsx';
import HomePage from './pages/HomePage.tsx'
import TourneyPage from './pages/TourneyPage.tsx'
import LeaderboardPage from './pages/LeaderboardPage.tsx'
import RoundPage from './pages/RoundPage';
import LoginPage from './pages/LoginPage.tsx';

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '1rem' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/tourney/1" style={{ marginRight: '1rem' }}>Tourney Example (from DB)</Link>
        <Link to="/tourney/1/round/1" style={{ marginRight: "1rem" }}>Round Example (from DB)</Link>
        <Link to="/tourney/1234/round/1234/leaderboard" style={{ marginRight: '1rem' }}>Leaderboard Example (hard-coded)</Link>
        <Link to="/login" style={{ marginRight: '1rem' }}>Login (will be secret path for beta)</Link>
        <Link to="/tourney/1234/round/1234/stage/1234" style={{ marginRight: '1rem' }}>Chart Pool Example (hard-coded)</Link>
        <Link to="/charts">All Charts (hard-coded)</Link>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tourney/:tourneyId" element={<TourneyPage />} />
        <Route path="/tourney/:tourneyId/round/:roundId" element={<RoundPage />} />
        <Route path="/tourney/:tourneyId/round/:roundId/leaderboard" element={<LeaderboardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/tourney/:tourneyId/round/:roundId/stage/:stageId" element={<ChartPoolPage />} />
        <Route path="/charts" element={<ChartsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
