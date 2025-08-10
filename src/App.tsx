import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.tsx'
import TourneyPage from './pages/Tourney.tsx'
import Leaderboard from './pages/Leaderboard.tsx'
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
        <Route path="/" element={<Home />} />
        <Route path="/tourney/:tourneyId" element={<TourneyPage />} />
        <Route path="/tourney/:tourneyId/round/:roundId/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
