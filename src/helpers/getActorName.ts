import type { PickbanActor } from "../types/Pickban";

export default function getActorName(actor: PickbanActor, format: "full" | "first" | "short") {
  const name = actor || "Automation";
  if (format === "short") {
    if (name === "Higher Seed") return "H";
    if (name === "Lower Seed") return "L";
    if (name === "Automation") return "A";
  }
  if (format === "first") {
    if (name === "Higher Seed") return "Higher";
    if (name === "Lower Seed") return "Lower";
    if (name === "Automation") return "Auto";
  }
  return name;
};