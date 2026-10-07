import { Text, type TextProps } from "@chakra-ui/react";
import { SlCamrecorder } from "react-icons/sl";

interface BroadcastLabelProps extends Omit<TextProps, "children"> {
  // The heat card's control reads "Broadcast:"; help text refers to it bare.
  withColon?: boolean;
}

/**
 * The camera icon + "Broadcast" label for a heat's broadcast control. Shared by
 * that control and the Broadcast tab's help text, so the help always names the
 * control the way it actually reads.
 *
 * inline-flex keeps the icon on the same line: Chakra's reset makes svgs
 * display:block, which otherwise drops the icon onto its own line.
 */
export function BroadcastLabel({ withColon = false, ...rest }: BroadcastLabelProps) {
  return (
    <Text
      as="span"
      display="inline-flex"
      alignItems="center"
      gap={1}
      verticalAlign="middle"
      whiteSpace="nowrap"
      {...rest}
    >
      <SlCamrecorder />
      Broadcast{withColon && ":"}
    </Text>
  );
}
