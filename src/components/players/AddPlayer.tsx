import { useState, useMemo } from "react";
import {
  HStack,
  Input,
  IconButton,
  Combobox,
  useFilter,
  useListCollection,
  Portal,
} from "@chakra-ui/react";
import { FaCheck } from "react-icons/fa";
import { MdOutlinePersonAddAlt } from "react-icons/md";
import { IoCloseSharp } from "react-icons/io5";

import type { PlayerTourney } from "../../types/PlayerTourney";
import type { PlayerRound } from "../../types/PlayerRound";

interface AddPlayerProps {
  onAdd: (name: string) => Promise<any>;
  loading?: boolean;
  tourneyPlayers?: PlayerTourney[] | null;
  roundPlayers?: PlayerRound[] | null;
}

function AddPlayer({
  onAdd,
  loading,
  tourneyPlayers = null,
  roundPlayers = null,
}: AddPlayerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const hasCombobox = !!tourneyPlayers?.length;

  // Names of players already in this round
  const roundPlayerNames = useMemo(() => {
    if (!roundPlayers) return new Set<string>();
    return new Set(roundPlayers.map((p) => p.player_tourneys.player_name));
  }, [roundPlayers]);

  // Build combobox options (exclude players already in round)
  const playerOptions = useMemo(() => {
    if (!hasCombobox || !tourneyPlayers) return [];

    return tourneyPlayers
      .filter((p) => !roundPlayerNames.has(p.player_name))
      .map((p) => ({
        label: p.player_name,
        value: p.player_name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [tourneyPlayers, hasCombobox, roundPlayerNames]);

  const { contains } = useFilter({ sensitivity: "base" });
  const { collection, filter, reset } = useListCollection({
    initialItems: playerOptions,
    filter: contains,
  });

  const handleSave = async () => {
    if (!newName.trim()) return;
    await onAdd(newName.trim());
    setNewName("");
    setIsAdding(false);
    reset();
  };

  const handleCancel = () => {
    setNewName("");
    setIsAdding(false);
    reset();
  };

  return (
    <HStack align="center" justify="center">
      {isAdding ? (
        <>
          {hasCombobox ? (
            <Combobox.Root
              collection={collection}
              inputValue={newName}
              onInputValueChange={(e) => {
                setNewName(e.inputValue);
                filter(e.inputValue);
              }}
              onValueChange={(e) =>
                setNewName(e.value[0] ?? "")
              }
              size="sm"
            >
              <Combobox.Control>
                <Combobox.Input placeholder="Select or type..." />
                <Combobox.IndicatorGroup>
                  <Combobox.ClearTrigger />
                  <Combobox.Trigger />
                </Combobox.IndicatorGroup>
              </Combobox.Control>
              <Portal>
                <Combobox.Positioner>
                  <Combobox.Content>
                    <Combobox.Empty>No players found</Combobox.Empty>
                    {collection.items.map((item) => (
                      <Combobox.Item key={item.value} item={item}>
                        {item.label}
                        <Combobox.ItemIndicator />
                      </Combobox.Item>
                    ))}
                  </Combobox.Content>
                </Combobox.Positioner>
              </Portal>
            </Combobox.Root>
          ) : (
            <Input
              size="sm"
              placeholder="New Player Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
          )}

          <IconButton
            aria-label="Save player"
            variant="outline"
            borderWidth={2}
            size="sm"
            loading={loading}
            onClick={handleSave}
            colorPalette="green"
          >
            <FaCheck />
          </IconButton>

          <IconButton
            aria-label="Cancel edit"
            variant="outline"
            borderWidth={2}
            size="sm"
            onClick={handleCancel}
            colorPalette="red"
          >
            <IoCloseSharp />
          </IconButton>
        </>
      ) : (
        <IconButton
          aria-label="Add player"
          variant="outline"
          borderWidth={2}
          size="sm"
          px={2}
          colorPalette="green"
          onClick={() => setIsAdding(true)}
        >
          Add Player <MdOutlinePersonAddAlt />
        </IconButton>
      )}
    </HStack>
  );
}

export default AddPlayer;