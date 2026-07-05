export type PickbanAction = "PICK" | "BAN" | "PROTECT" | "AUTOPICK" | "IGNORE";
export type PickbanActor = "Higher Seed" | "Lower Seed" | "Automation" | null; // Automation doesnt exist on db (null instead), but frontend uses it for maps and stuff

export interface PickbanRulesetSteps {
  id: number;
  pickban_ruleset_id: number;
  action: PickbanAction;
  actor: PickbanActor;
  sequence: number;
  created_at: string;
}

export interface PickbanRuleset {
  id: number;
  tourney_id: number;
  name: string;
  created_at: string;
}

export interface PickbanRulesetWithSteps extends PickbanRuleset {
  pickban_ruleset_steps: PickbanRulesetSteps[];
}