import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ChartsPage from './pages/ChartsPage.tsx'
import CardDrawPage from './pages/CardDrawPage.tsx';
import HomePage from './pages/HomePage.tsx'
import TourneyPage from './pages/TourneyPage.tsx'
import LeaderboardPage from './pages/LeaderboardPage.tsx'
import RoundPage from './pages/RoundPage';
import LoginPage from './pages/LoginPage.tsx';

import './App.css'
import { Flex } from '@chakra-ui/react';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '1rem' }}>
        <Flex>
          <Link to="/" style={{ marginRight: "1rem" }}>Home</Link>
          <Link to="/tourney/1" style={{ marginRight: "1rem" }}>Tourney Example (from DB)</Link>
          <Link to="/tourney/1/round/1" style={{ marginRight: "1rem" }}>Round Example (from DB)</Link>
          <Link to="/tourney/1234/round/1234/leaderboard" style={{ marginRight: "1rem" }}>Leaderboard Example (hard-coded)</Link>
          <Link to="/login" style={{ marginRight: "1rem" }}>Login (will be secret path for beta)</Link>
          <Link to="/charts-card" style={{ marginRight: "1rem" }}>Charts (card)</Link>
          <Link to="/charts-row" style={{ marginRight: "1rem" }}>Charts (row)</Link>
          <Link to="/card-draw-animation" style={{ marginRight: "1rem" }}>Card Draw Animation</Link>
        </Flex>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tourney/:tourneyId" element={<TourneyPage />} />
        <Route path="/tourney/:tourneyId/round/:roundId" element={<RoundPage />} />
        <Route path="/tourney/:tourneyId/round/:roundId/leaderboard" element={<LeaderboardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/charts-card" element={<ChartsPage variant="card" />} />
        <Route path="/charts-row" element={<ChartsPage variant="row" />} />
        <Route path="/card-draw-animation" element={<CardDrawPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
