import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  ChakraProvider,
  Box,
  Text,
  defaultSystem,
  Button,
} from "@chakra-ui/react";
import { SlArrowUp } from "react-icons/sl";

import HomePage from "./pages/HomePage.tsx";
import TourneyPage from "./pages/TourneyPage.tsx";
import LeaderboardPage from "./pages/LeaderboardPage.tsx";
import RoundPage from "./pages/RoundPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import ChartRollPage from "./pages/ChartRollPage.tsx";
import { HeroTitle } from "./components/ui/HeroTitle";
import { ColorModeProvider } from "./components/ui/color-mode";
import { CurrentTourneyProvider } from "./context/CurrentTourneyContext.tsx";
import { AdminTourneyProvider } from "./context/TourneyAdminContext.tsx";

import "./App.css";

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      {/* Force global dark mode */}
      <ColorModeProvider forcedTheme="dark">
        <AdminTourneyProvider>
          <CurrentTourneyProvider>
            <Box bg="gray.900" color="white" minH="100vh">
              <BrowserRouter>
                {/* HeroTitle Card on all pages */}
                <HeroTitle />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/tourney/:tourneyId" element={<TourneyPage />} />
                  <Route
                    path="/tourney/:tourneyId/round/:roundId"
                    element={<RoundPage />}
                  />
                  <Route
                    path="/tourney/:tourneyId/round/:roundId/leaderboard"
                    element={<LeaderboardPage />}
                  />
                  <Route
                    path="/tourney/:tourneyId/round/:roundId/stage/:stageId/roll"
                    element={<ChartRollPage />}
                  />
                  <Route path="/login" element={<LoginPage />} />
                </Routes>
                {/* Footer on all pages */}
                <Box w="100%" py={100}>
                  <Text textAlign="center" fontSize="lg" mb={5}>
                    Piu Tourney Builder 2025 ©
                  </Text>
                  <Button
                    size="sm"
                    colorPalette="blue"
                    variant="outline"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    <SlArrowUp /> Back to Top
                  </Button>
                </Box>
              </BrowserRouter>
            </Box>
          </CurrentTourneyProvider>
        </AdminTourneyProvider>
      </ColorModeProvider>
    </ChakraProvider>
  );
}

export default App;
