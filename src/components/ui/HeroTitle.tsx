import { Box, Heading, Image } from "@chakra-ui/react";
import { Link } from "react-router-dom";

interface HeroTitleProps {
  text?: string; // optional, defaults to site title
  imageUrl?: string; // optional, defaults to the banner image
}

export const HeroTitle: React.FC<HeroTitleProps> = ({
  text = "Pump It Up Tournament Builder",
  imageUrl = "https://preview.redd.it/pump-it-up-phoenix-2024-v0-wingd1wryw0d1.jpeg?auto=webp&s=00bf42c49d7b475464de9f65df97374e4ebbfd49",
}) => {
  return (
    <Box position="relative" w="100%" mb={8} h={{ base: "25vh", sm: "30vh", md: "25vh" }} px={{ base: 2, sm: 4 }}>
      <Image
        src={imageUrl}
        alt="Banner"
        w="100%"
        h="100%"
        objectFit="cover"
        objectPosition="center"
        borderRadius="md"
      />
      <Link to="/">
        <Heading
          as="h1"
          fontSize="clamp(1.5rem, 6vw, 3.5rem)" // single, responsive font size
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          color="white"
          textAlign="center"
          textShadow="4px 4px 8px rgba(0,0,0,0.7)"
          whiteSpace={{ base: "normal", md: "nowrap" }}
          wordBreak="break-word"
          _hover={{ cursor: "pointer", opacity: 0.8 }}
        >
          {text}
        </Heading>
      </Link>
    </Box>
  );
};
