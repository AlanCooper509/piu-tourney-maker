import { useEffect, useState } from "react";
import { Image, Box, type BoxProps } from "@chakra-ui/react";

interface PlayerAvatarProps extends Omit<BoxProps, "as" | "src"> {
  src: string | null | undefined;
  alt: string;
  size: string;
}

/**
 * Renders a player's profile picture at a fixed square size, falling back
 * to a grey placeholder box whenever there's no picture set OR the URL
 * fails to actually load (deleted file, bad URL, host throttling, etc.) —
 * so a broken link never shows a broken-image icon on stream.
 */
export function PlayerAvatar({ src, alt, size, ...rest }: PlayerAvatarProps) {
  const [failed, setFailed] = useState(false);

  // Reset once the URL itself changes, so a corrected/edited image gets a
  // fresh chance to load instead of being stuck on a prior failure.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <Box flexShrink={0} width={size} height={size} bg="gray.500" {...rest} />
    );
  }

  return (
    <Image
      as="img"
      src={src}
      alt={alt}
      flexShrink={0}
      width={size}
      height={size}
      objectFit="cover"
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
