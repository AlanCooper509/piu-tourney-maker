export type PickbanAction = "PICK" | "BAN" | "PROTECT" | "AUTOPICK" | "IGNORE";

export interface PickbanRulesetSteps {
  id: number;
  pickban_ruleset_id: number;
  action: PickbanAction;
  actor: string | null;
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