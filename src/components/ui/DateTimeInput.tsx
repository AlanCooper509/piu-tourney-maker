import { Text } from "@chakra-ui/react";

interface DateTimeInputProps {
  label: string;
}

export default function DateTimeInput({ label }: DateTimeInputProps) {
  // Not Yet Implemented...
  // Trouble figuring out (and integrating) which library to use for date/time picking
  return (
    <Text>{label}</Text>
  );
}