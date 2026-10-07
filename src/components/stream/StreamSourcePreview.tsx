import { useEffect, useRef, useState } from "react";
import { Box, Text } from "@chakra-ui/react";

// The preview renders the source at a typical OBS Browser Source size and
// scales it down to fit, so text and card sizes look the way they will on
// stream rather than reflowing to the narrow panel.
const VIRTUAL_WIDTH = 1920;
const VIRTUAL_HEIGHT = 400;

// Sources are transparent; a checkerboard shows where they draw nothing.
const CHECKERBOARD =
  "repeating-conic-gradient(#2a2a2e 0% 25%, #1f1f23 0% 50%) 50% / 24px 24px";

export function StreamSourcePreview({ url, title }: { url: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / VIRTUAL_WIDTH);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Box
        ref={containerRef}
        position="relative"
        overflow="hidden"
        borderRadius="md"
        borderWidth={1}
        borderColor="whiteAlpha.200"
        height={`${VIRTUAL_HEIGHT * scale}px`}
        style={{ background: CHECKERBOARD }}
      >
        <iframe
          src={url}
          title={`${title} preview`}
          loading="lazy"
          style={{
            width: `${VIRTUAL_WIDTH}px`,
            height: `${VIRTUAL_HEIGHT}px`,
            border: 0,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            colorScheme: "normal",
          }}
        />
      </Box>
      {/* Read from the same constants the frame uses, so it can't go stale. */}
      <Text fontSize="xs" fontStyle="italic" color="whiteAlpha.500" mt={1} textAlign="right">
        Preview at {VIRTUAL_WIDTH} × {VIRTUAL_HEIGHT}, scaled to fit. Your OBS source can be any
        size.
      </Text>
    </>
  );
}
