import {
  Badge,
  Box,
  Button,
  Field,
  HStack,
  Heading,
  Input,
  Separator,
  Stack,
  Switch,
  Text,
  VStack,
} from "@chakra-ui/react";

import { isCommittable, scoresForChart } from "../../../handlers/ddrtools/buildPullPlan";

import type { PullPlan, PulledRound } from "../../../handlers/ddrtools/buildPullPlan";

interface Props {
  link: string;
  setLink: (v: string) => void;
  loading: boolean;
  error: string | null;
  plan: PullPlan | null;
  advance: boolean;
  setAdvance: (v: boolean) => void;
  onLoad: () => void;
}

export default function PullFromDdrToolsFormBody({
  link,
  setLink,
  loading,
  error,
  plan,
  advance,
  setAdvance,
  onLoad,
}: Props) {
  return (
    <Stack gap={4}>
      <Field.Root>
        <Field.Label>ddr.tools event link</Field.Label>
        <HStack width="100%">
          <Input
            value={link}
            placeholder="https://ddr.tools/e/my-event"
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onLoad();
              }
            }}
          />
          <Button
            variant="outline"
            borderWidth={2}
            colorPalette="blue"
            loading={loading}
            onClick={onLoad}
          >
            Load
          </Button>
        </HStack>
        <Field.HelperText>
          Reads the charts played and the scores recorded in that room. Nothing
          is written until you submit.
        </Field.HelperText>
      </Field.Root>

      {error && <Text color="red.500">{error}</Text>}

      {plan && <PlanReview plan={plan} />}

      {plan && plan.rounds.some(isCommittable) && (
        <>
          <Separator />
          <Switch.Root
            size="sm"
            colorPalette="orange"
            checked={advance}
            onCheckedChange={(e) => setAdvance(e.checked)}
          >
            <Switch.HiddenInput />
            <Switch.Control />
            <Switch.Label fontSize="sm">
              Also end each round and advance its players
            </Switch.Label>
          </Switch.Root>
          {advance && (
            <Text fontSize="xs" color="orange.600">
              Advancing moves players into the next round and marks these rounds
              complete. That can't be undone from here.
            </Text>
          )}
        </>
      )}
    </Stack>
  );
}

function PlanReview({ plan }: { plan: PullPlan }) {
  const ready = plan.rounds.filter(isCommittable).length;
  if (!plan.rounds.length) {
    return (
      <Text>
        That room has no draws for this tournament
        {plan.skipped ? ` (${plan.skipped} draw(s) belong elsewhere)` : ""}.
      </Text>
    );
  }
  return (
    <VStack align="stretch" gap={3}>
      <Text fontSize="sm">
        <strong>{ready}</strong> of {plan.rounds.length} match
        {plan.rounds.length === 1 ? "" : "es"} ready to commit
        {plan.skipped ? ` · ${plan.skipped} draw(s) belong elsewhere` : ""}
      </Text>
      {plan.rounds.map((round) => (
        <RoundReview key={round.drawingId} round={round} />
      ))}
    </VStack>
  );
}

function RoundReview({ round }: { round: PulledRound }) {
  const committable = isCommittable(round);
  return (
    <Box
      borderWidth={1}
      borderRadius="md"
      p={3}
      opacity={round.blocker ? 0.6 : 1}
    >
      <HStack justifyContent="space-between" mb={1}>
        <Heading size="sm">{round.title}</Heading>
        <Badge colorPalette={committable ? "green" : "gray"}>
          {committable ? "ready" : "skipped"}
        </Badge>
      </HStack>
      <Text fontSize="xs" color="fg.muted">
        {round.players.map((p) => p.name).join(" vs ") || "no players"}
        {round.gameKey ? ` · ${round.gameKey}` : ""}
      </Text>

      {round.blocker ? (
        <Text fontSize="sm" color="orange.600" mt={2}>
          {round.blocker}
        </Text>
      ) : (
        <VStack align="stretch" gap={1} mt={2}>
          {round.charts.map((chart) => (
            <HStack
              key={chart.id}
              justifyContent="space-between"
              borderWidth={1}
              borderRadius="sm"
              px={2}
              py={1}
            >
              <Text fontSize="sm" truncate>
                {chart.name}{" "}
                <Text as="span" color="fg.muted">
                  {chart.diffAbbr} {chart.level}
                </Text>
                {round.pocketPickIds.includes(chart.id) && (
                  <Text as="span" color="purple.fg">
                    {" "}
                    · pocket pick
                  </Text>
                )}
              </Text>
              <Text fontSize="xs" color="fg.muted" flexShrink={0}>
                {scoresForChart(round, chart.id)
                  .map(
                    (s) =>
                      `${s.name} ${typeof s.score === "number" ? s.score.toLocaleString() : "-"}`,
                  )
                  .join(" · ")}
              </Text>
            </HStack>
          ))}
          {round.bannedCount > 0 && (
            <Text fontSize="xs" color="fg.muted">
              {round.bannedCount} banned chart(s) left out — they were drawn but
              never played
            </Text>
          )}
        </VStack>
      )}
    </Box>
  );
}
