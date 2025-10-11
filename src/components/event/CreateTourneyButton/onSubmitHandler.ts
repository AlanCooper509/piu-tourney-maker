import { toaster } from '../../ui/toaster';
import { tourneyTypes, type Tourney, type TourneyType } from '../../../types/Tourney';
import handleAddNewTourney from '../../../handlers/handleAddNewTourney';

interface OnSubmitHandlerProps {
  tourneyName: string;
  startDate: Date | null;
  endDate: Date | null;
  eventId: number;
  tourneyFormat: string[];
  resetForm: () => void;
  tourneys: Tourney[];
  setTourneys: React.Dispatch<React.SetStateAction<Tourney[]>>;
}

export default async function onSubmitHandler({ tourneyName, startDate, endDate, eventId, tourneyFormat, resetForm, tourneys, setTourneys }: OnSubmitHandlerProps): Promise<boolean> {
  if (!isValidTourneyName(tourneyName)) {
    sendToast("Error", "Enter a tourney name!", "error");
    return false; // Prevent form submission
  }

  if (!startDate) {
    sendToast("Error", "Select a start date!", "error");
    return false; // Prevent form submission
  }

  if (!endDate) {
    sendToast("Error", "Select an end date!", "error");
    return false; // Prevent form submission
  }

  if (startDate && endDate && isValidDates(startDate, endDate) === false) {
    sendToast("Error", "Start date must be before end date!", "error");
    return false; // Prevent form submission
  }

  if (!isValidTourneyType(tourneyFormat)) {
    sendToast("Error", "Select a valid tourney format!", "error");
    return false; // Prevent form submission
  }

  // All validations passed, attempt to create the tourney on supabase
  let data = null;
  try {
    const response = await handleAddNewTourney(tourneyName.trim(), startDate.toISOString(), endDate.toISOString(), eventId, tourneyFormat);
    if (!response) {
      sendToast("Error", "Failed to create tourney: No data returned", "error");
      return false; // Prevent form submission
    }
    data = response;
  } catch (error: any) {
    // exception by React side handler
    sendToast("Error", `Failed to create tourney: ${error.message}`, "error");
    return false; // Prevent form submission
  }

  // Successfully created tourney!
  sendToast("Success", `Tourney "${data.name}" created!`, "success");

  // Reset frontend React state values
  resetForm();

  // Update the tourneys state with the new tourney
  const tourneys_data = [...tourneys, data];
  tourneys_data?.sort((a, b) => a.start_date.localeCompare(b.start_date));
  setTourneys(prev => {
    const updated = [...prev, data].sort((a, b) =>
      a.start_date.localeCompare(b.start_date)
    );
    return updated;
  });

  // Allows form submission to close the dialog
  return true;
}

// Helper functions
function sendToast(title: string, description: string, type: "error" | "success" | "info" | "warning") {
  toaster.create({
    title,
    description,
    type,
    closable: true,
  });
}

function isValidTourneyName(name: string): boolean {
  return name.trim().length > 0;
}

function isValidDates(start: Date, end: Date): boolean {
  return start <= end;
}

function isValidTourneyType(types: string[]): types is [TourneyType] {
  return types.length === 1 && tourneyTypes.includes(types[0] as TourneyType);
}