import { useState } from "react";
import { Box, Code, Collapsible, HStack, IconButton, Text } from "@chakra-ui/react";
import { IoChevronForward } from "react-icons/io5";
import { LuCopy, LuExternalLink } from "react-icons/lu";

import { StreamSourcePreview } from "./StreamSourcePreview";

import type { ReactNode } from "react";

interface StreamSourceRowProps {
  label: string;
  url: string;
  onCopy: (url: string) => void;
  // Per-source options and hints, shown above the preview when expanded.
  children?: ReactNode;
}

export function StreamSourceRow({ label, url, onCopy, children }: StreamSourceRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    // lazyMount + unmountOnExit: the preview iframe (and its live
    // subscriptions) only exists while the row is expanded.
    <Collapsible.Root
      open={isOpen}
      onOpenChange={(details) => setIsOpen(details.open)}
      lazyMount
      unmountOnExit
    >
      <HStack gap={2}>
        <Collapsible.Trigger asChild>
          <HStack w="160px" flexShrink={0} cursor="pointer" gap={2}>
            <IoChevronForward
              style={{
                transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
                flexShrink: 0,
              }}
            />
            <Text fontSize="sm">{label}</Text>
          </HStack>
        </Collapsible.Trigger>
        <Code flex={1} minW={0} truncate fontSize="xs" title={url}>
          {url}
        </Code>
        <IconButton size="xs" variant="ghost" aria-label={`Copy ${label} URL`} onClick={() => onCopy(url)}>
          <LuCopy />
        </IconButton>
        <IconButton size="xs" variant="ghost" aria-label={`Open ${label}`} asChild>
          <a href={url} target="_blank" rel="noreferrer">
            <LuExternalLink />
          </a>
        </IconButton>
      </HStack>

      <Collapsible.Content>
        {/* padding rather than margin, so it's part of the height the collapse animates */}
        <Box pl="24px" pt={1} pb={3}>
          {children && (
            <Box mb={2} textAlign="left">
              {children}
            </Box>
          )}
          <StreamSourcePreview url={url} title={label} />
        </Box>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
