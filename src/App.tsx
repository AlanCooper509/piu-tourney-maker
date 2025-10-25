import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  Box,
  Text,
  Button,
  Separator,
} from "@chakra-ui/react";
import { SlArrowUp } from "react-icons/sl";

import EventPage from "./pages/EventPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import TourneyPage from "./pages/TourneyPage.tsx";
import LeaderboardPage from "./pages/LeaderboardPage.tsx";
import RoundPage from "./pages/RoundPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import ChartRollPage from "./pages/ChartRollPage.tsx";
import { HeroTitle } from "./components/ui/HeroTitle";
import { CurrentTourneyProvider } from "./context/CurrentTourneyContext.tsx";
import { AdminTourneyProvider } from "./context/admin/AdminTourneyContext.tsx";
import { AdminEventProvider } from "./context/admin/AdminEventContext.tsx";

import "./App.css";

function App() {
  return (
    <AdminEventProvider>
      <AdminTourneyProvider>
        <CurrentTourneyProvider>
          <Box bg="gray.900" color="white" minH="100vh" className="dark">
            <BrowserRouter>
              {/* HeroTitle Card on all pages */}
              <HeroTitle />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/tourney/:tourneyId"
                  element={<TourneyPage />}
                />
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
                <Route path="/event/:eventId" element={<EventPage />} />
              </Routes>
              {/* Footer on all pages */}
              <Separator mt={8} mb={8} />

              <Box w="100%" py={100}>
                <Text textAlign="center" fontSize="lg" mb={5}>
                  Piu Tourney Maker 2025 ©
                </Text>
                <Button
                  size="sm"
                  colorPalette="blue"
                  variant="outline"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  <SlArrowUp /> Back to Top
                </Button>
              </Box>
            </BrowserRouter>
          </Box>
        </CurrentTourneyProvider>
      </AdminTourneyProvider>
    </AdminEventProvider>
  );
}

export default App;
