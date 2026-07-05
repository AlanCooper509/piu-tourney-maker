import type { PickbanActor } from "../types/Pickban";

export default function getActorName(actor: PickbanActor, format: "full" | "short") {
  const name = actor || "Automation";
  if (format === "short") {
    if (name === "Higher Seed") return "H";
    if (name === "Lower Seed") return "L";
    if (name === "Automation") return "A";
  }
  return name;
};