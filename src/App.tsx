import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box, Text, defaultSystem } from '@chakra-ui/react';

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
            {/* HeroTitle Card on all pages */}
            <HeroTitle />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/tourney/:tourneyId" element={<TourneyPage />} />
              <Route path="/tourney/:tourneyId/round/:roundId" element={<RoundPage />} />
              <Route path="/tourney/:tourneyId/round/:roundId/leaderboard" element={<LeaderboardPage />} />
              <Route path="/tourney/:tourneyId/round/:roundId/stage/:stageId/roll" element={<ChartRollPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
            {/* Footer on all pages */}
            <Box mt={12} w="100%">
              <hr style={{ borderColor: 'grey', borderWidth: '1px' }} />
              <Text textAlign="center" py={4} fontSize="lg">Welcome to Beast in the East 8!</Text>
            </Box>
          </BrowserRouter>
        </Box>
      </ColorModeProvider>
    </ChakraProvider>
  );
}

export default App;
