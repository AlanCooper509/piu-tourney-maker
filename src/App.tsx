import { BrowserRouter, Routes, Route, useLocation, matchPath } from "react-router-dom";
import { Box, Text, Button, Separator } from "@chakra-ui/react";
import { SlArrowUp } from "react-icons/sl";

import EventPage from "./pages/EventPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import TourneyPage from "./pages/TourneyPage.tsx";
import LeaderboardPage from "./pages/LeaderboardPage.tsx";
import RoundPage from "./pages/RoundPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import ChartRollPage from "./pages/ChartRollPage.tsx";
import StreamHelper from "./pages/StreamHelper.tsx";
import StreamViewer from "./pages/StreamViewer.tsx";
import { HeroTitle } from "./components/ui/HeroTitle";
import { CurrentTourneyProvider } from "./context/CurrentTourneyContext.tsx";
import { AdminTourneyProvider } from "./context/admin/AdminTourneyContext.tsx";
import { AdminEventProvider } from "./context/admin/AdminEventContext.tsx";

import "./App.css";

// Matched against the current path to detect the OBS-facing Stream Viewer
// route, which must render as bare, transparent content with none of the
// app chrome below (header, footer, page background) so a Browser Source
// pointed at it composites cleanly with nothing but the overlay itself.
const STREAM_VIEWER_PATH = "/tourney/:tourneyId/StreamViewer";

const appRoutes = (
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
    <Route path="/event/:eventId" element={<EventPage />} />
    <Route
      path="/tourney/:tourneyId/StreamHelper"
      element={<StreamHelper />}
    />
    <Route path={STREAM_VIEWER_PATH} element={<StreamViewer />} />
  </Routes>
);

function AppRoutes() {
  const location = useLocation();
  const isStreamViewer = Boolean(
    matchPath(STREAM_VIEWER_PATH, location.pathname),
  );

  if (isStreamViewer) {
    return appRoutes;
  }

  return (
    <Box bg="gray.900" color="white" minH="100vh" className="dark">
      {/* HeroTitle Card on all pages except Stream Viewer */}
      <HeroTitle />
      {appRoutes}
      {/* Footer on all pages except Stream Viewer */}
      <Separator mt={8} mb={8} />

      <Box w="100%" py={100}>
        <Text textAlign="center" fontSize="lg" mb={5}>
          PIU Tourney Maker 2026 ©
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
    </Box>
  );
}

function App() {
  return (
    <AdminEventProvider>
      <AdminTourneyProvider>
        <CurrentTourneyProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </CurrentTourneyProvider>
      </AdminTourneyProvider>
    </AdminEventProvider>
  );
}

export default App;
