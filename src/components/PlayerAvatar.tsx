import { useEffect, useState } from "react";
import { Image, type BoxProps } from "@chakra-ui/react";

interface PlayerAvatarProps extends Omit<BoxProps, "as" | "src"> {
  src: string | null | undefined;
  alt: string;
  size: string;
}

/**
 * Renders a player's profile picture at a fixed square size, or nothing at all
 * when there's no picture set OR the URL fails to load (deleted file, bad URL,
 * host throttling, etc.), so the name stands alone instead of beside an empty
 * box or a broken-image icon.
 */
export function PlayerAvatar({ src, alt, size, ...rest }: PlayerAvatarProps) {
  const [failed, setFailed] = useState(false);

  // Reset once the URL itself changes, so a corrected/edited image gets a
  // fresh chance to load instead of being stuck on a prior failure.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) return null;

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
