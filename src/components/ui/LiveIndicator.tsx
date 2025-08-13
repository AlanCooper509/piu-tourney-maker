import { Box } from "@chakra-ui/react";
import './LiveIndicator.css';

export function LiveIndicator() {
  return (
    <Box
      w="10px"
      h="10px"
      bg="green.500"
      borderRadius="full"
      animation="pulse 1s infinite"
    />
  );
}