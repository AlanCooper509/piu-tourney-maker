import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ChakraProvider, Box, defaultSystem } from '@chakra-ui/react';

import HomePage from './pages/HomePage.tsx';
import TourneyPage from './pages/TourneyPage.tsx';
import LeaderboardPage from './pages/LeaderboardPage.tsx';
import RoundPage from './pages/RoundPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import ChartRollPage from './pages/ChartRollPage.tsx';

import { HeroTitle } from './components/ui/HeroTitle';
import { ColorModeProvider } from './components/ui/color-mode';

import './App.css';

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      {/* Force global dark mode */}
      <ColorModeProvider forcedTheme="dark">
        <Box bg="gray.900" color="white" minH="100vh">
          <BrowserRouter>
            {/* Hero shown on every page */}
            <HeroTitle />

            <nav style={{ padding: '1rem' }}>
              <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
              <Link to="/tourney/1" style={{ marginRight: '1rem' }}>Tourney Example (from DB)</Link>
              <Link to="/tourney/1/round/1" style={{ marginRight: "1rem" }}>Round Example (from DB)</Link>
              <Link to="/tourney/1234/round/1234/leaderboard" style={{ marginRight: '1rem' }}>Leaderboard Example (hard-coded)</Link>
              <Link to="/login">Login (will be secret path for beta)</Link>
            </nav>

            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/tourney/:tourneyId" element={<TourneyPage />} />
              <Route path="/tourney/:tourneyId/round/:roundId" element={<RoundPage />} />
              <Route path="/tourney/:tourneyId/round/:roundId/leaderboard" element={<LeaderboardPage />} />
              <Route path="/tourney/:tourneyId/round/:roundId/stage/:stageId/roll" element={<ChartRollPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </BrowserRouter>
        </Box>
      </ColorModeProvider>
    </ChakraProvider>
  );
}

export default App;
