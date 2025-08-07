import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Leaderboard from './pages/Leaderboard.tsx'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '1rem' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/tournament/1234/round/1234/leaderboard">Leaderboard</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tournament/:tournamentId/round/:roundId/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}

function Home() {
  return <h2>(Placeholder; try tabs to see example frontend routes)</h2>;
}

export default App
