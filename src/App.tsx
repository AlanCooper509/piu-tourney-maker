import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx'
import TourneyPage from './pages/TourneyPage.tsx'
import LeaderboardPage from './pages/LeaderboardPage.tsx'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '1rem' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/tourney/1" style={{ marginRight: '1rem' }}>Tourney Example (from DB)</Link>
        <Link to="/tourney/1234/round/1234/leaderboard">Leaderboard Example (hard-coded)</Link>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tourney/:tourneyId" element={<TourneyPage />} />
        <Route path="/tourney/:tourneyId/round/:roundId/leaderboard" element={<LeaderboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
