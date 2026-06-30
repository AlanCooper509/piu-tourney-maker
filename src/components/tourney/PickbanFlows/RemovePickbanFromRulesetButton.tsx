import { useState } from "react";
import { Button } from "@chakra-ui/react";
import { LuTrash2 } from "react-icons/lu";

import { toaster } from "../../ui/toaster";
import { handleRemovePickBanFlow } from "../../../handlers/pickban/handleRemovePickBanFlow";

interface RemovePickbanFromRulesetButtonProps {
  configId: number;
}

export default function RemovePickbanFromRulesetButton({ configId }: RemovePickbanFromRulesetButtonProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await handleRemovePickBanFlow(configId);

      toaster.create({
        title: "Ruleset Removed",
        description: "Successfully detached the pick/ban ruleset from this configuration.",
        type: "success",
      });
    } catch (err: any) {
      toaster.create({
        title: "Removal Failed",
        description: err.message || "Could not detach the ruleset.",
        type: "error",
      });
      setIsRemoving(false);
    } finally {
      // don't need to setIsRemoving(false) if successful; it'll get unmounted
    }
  };

  return (
    <Button
      size="xs"
      variant="outline"
      colorPalette="red"
      loadingText="Removing..."
      loading={isRemoving}
      onClick={handleRemove}
    >
      Remove Pick/Ban Flow <LuTrash2 />
    </Button>
  );
}