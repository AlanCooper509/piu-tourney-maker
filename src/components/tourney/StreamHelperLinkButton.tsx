import { IconButton } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { SlCamrecorder } from "react-icons/sl";

import { streamHelperPath } from "../../helpers/paths";

import type { Tourney } from "../../types/Tourney";

export default function StreamHelperLinkButton({ tourney }: { tourney: Tourney }) {
  return (
    <RouterLink to={streamHelperPath(tourney.id, tourney.event_id)}>
      <IconButton variant="outline" colorPalette="purple" borderWidth="2px" size="sm" px={2}>
        Stream Helper <SlCamrecorder />
      </IconButton>
    </RouterLink>
  );
}
