import { IconButton } from "@chakra-ui/react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

interface Props {
  side: "left" | "right";
  onClick: () => void;
}

export function SpotlightNavButton({ side, onClick }: Props) {
  return (
    <IconButton
      aria-label={side === "left" ? "Previous event" : "Next event"}
      onClick={onClick}
      display={{ base: "none", lg: "inline-flex" }} // desktop only (prevents clashing with event details on mobile)
      position="absolute" //offset from the slide bottom by SpotlightEventItem's pb={10} (40px), so center on the card, not the slide
      top="calc(50% - 20px)"
      transform="translateY(-50%)"
      {...(side === "left" ? { left: 3 } : { right: 3 })}
      zIndex={2}
      size="md"
      borderRadius="full"
      variant="ghost"
      color="white"
      bg="blackAlpha.500"
      backdropFilter="blur(6px)"
      border="1px solid"
      borderColor="whiteAlpha.300"
      _hover={{ bg: "blackAlpha.700", borderColor: "whiteAlpha.600" }}
    >
      {side === "left" ? <IoChevronBack /> : <IoChevronForward />}
    </IconButton>
  );
}
