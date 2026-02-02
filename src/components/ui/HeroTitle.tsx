import { Box, Heading, Image, useBreakpointValue } from "@chakra-ui/react";
import { Link } from "react-router-dom";

interface HeroTitleProps {
  text?: string;
  imageUrl?: string;
}

export const HeroTitle: React.FC<HeroTitleProps> = ({
  text = "Pump It Up Tourney Maker",
  imageUrl = "https://preview.redd.it/pump-it-up-phoenix-2024-v0-wingd1wryw0d1.jpeg?auto=webp&s=00bf42c49d7b475464de9f65df97374e4ebbfd49",
}) => {
  const shadow = useBreakpointValue({
    base: "1px 1px 2px rgba(0,0,0,0.9)",
    md: "2px 2px 6px rgba(0,0,0,0.85)",
  });

  return (
    <Box
      position="relative"
      w="100%"
      h={{ base: "5vh", sm: "10vh", md: "20vh" }}
    >
      {/* Background Image */}
      <Image
        src={imageUrl}
        alt="Banner"
        w="100%"
        h="100%"
        objectFit="cover"
        objectPosition="center"
      />
      {/* Dim overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        w="100%"
        h="100%"
        bg="rgba(0,0,0,0.2)"
      />
      <Link to="/">
        <Heading
          as="h1"
          fontSize="clamp(1rem, 6vw, 6rem)" // shrink aggressively on very small screens, huge on desktop
          fontWeight={{ base: "bold", md: "extrabold" }}
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          color="#f5f5f5"
          textAlign="center"
          whiteSpace="nowrap" // always single line
          overflow="hidden"
          textOverflow="ellipsis"
          textShadow={shadow}
          _hover={{ cursor: "pointer", opacity: 0.85 }}
        >
          {text}
        </Heading>
      </Link>
    </Box>
  );
};
