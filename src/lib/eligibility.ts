import { DEGREE_LEVEL_RANK, type EligibilityResultValue } from "@/lib/enums";

// A configurable rule attached to an Opportunity (PRD §21-23). `value` is
// always stored as a string on EligibilityRule; IN/NOT_IN pack a
// comma-separated list into that same string.
export type RuleInput = {
  id: string;
  field: string;
  operator: string;
  value: string;
  label: string;
  required: boolean;
};

export type RuleEvaluation = {
  ruleId: string;
  label: string;
  required: boolean;
  met: boolean | null; // null = we don't have data to evaluate (UNKNOWN)
};

export type EligibilityReport = {
  result: EligibilityResultValue;
  evaluations: RuleEvaluation[];
  missing: string[]; // labels of required rules we couldn't evaluate or that failed
};

// Snapshot of the facts pulled off a student's profile that rules get
// evaluated against. Deliberately flat and small — see PRD §98: deterministic
// rules first, no opaque scoring.
export type StudentFacts = {
  gpa: number | null;
  qualificationLevel: string | null; // highest academic record's `level`
  nationality: string | null;
  countryOfResidence: string | null;
  fieldOfStudy: string | null;
};

function coerceNumber(v: string): number {
  return Number(v);
}

function evaluateOne(rule: RuleInput, facts: StudentFacts): boolean | null {
  const factValue = (facts as Record<string, string | number | null>)[rule.field];

  if (rule.operator === "EXISTS") {
    return factValue !== null && factValue !== undefined && factValue !== "";
  }

  if (factValue === null || factValue === undefined || factValue === "") {
    return null; // unknown — student hasn't supplied this data yet
  }

  switch (rule.operator) {
    case "EQUALS":
      return String(factValue).toLowerCase() === rule.value.toLowerCase();
    case "NOT_EQUALS":
      return String(factValue).toLowerCase() !== rule.value.toLowerCase();
    case "CONTAINS":
      return String(factValue).toLowerCase().includes(rule.value.toLowerCase());
    case "IN":
      return rule.value
        .split(",")
        .map((v) => v.trim().toLowerCase())
        .includes(String(factValue).toLowerCase());
    case "NOT_IN":
      return !rule.value
        .split(",")
        .map((v) => v.trim().toLowerCase())
        .includes(String(factValue).toLowerCase());
    case "GREATER_THAN":
    case "GREATER_THAN_OR_EQUAL":
    case "LESS_THAN":
    case "LESS_THAN_OR_EQUAL": {
      let left: number | null = null;
      let right: number | null = null;
      if (rule.field === "qualificationLevel") {
        left = factValue ? DEGREE_LEVEL_RANK[String(factValue)] ?? null : null;
        right = DEGREE_LEVEL_RANK[rule.value] ?? null;
      } else {
        left = coerceNumber(String(factValue));
        right = coerceNumber(rule.value);
      }
      if (left === null || right === null || Number.isNaN(left) || Number.isNaN(right)) return null;
      if (rule.operator === "GREATER_THAN") return left > right;
      if (rule.operator === "GREATER_THAN_OR_EQUAL") return left >= right;
      if (rule.operator === "LESS_THAN") return left < right;
      return left <= right;
    }
    default:
      return null;
  }
}

export function evaluateEligibility(rules: RuleInput[], facts: StudentFacts): EligibilityReport {
  const evaluations: RuleEvaluation[] = rules.map((rule) => ({
    ruleId: rule.id,
    label: rule.label,
    required: rule.required,
    met: evaluateOne(rule, facts),
  }));

  const requiredRules = evaluations.filter((e) => e.required);
  const anyRequiredFailed = requiredRules.some((e) => e.met === false);
  const anyRequiredUnknown = requiredRules.some((e) => e.met === null);
  const missing = evaluations.filter((e) => e.met !== true).map((e) => e.label);

  let result: EligibilityResultValue;
  if (anyRequiredFailed) {
    result = "NOT_ELIGIBLE";
  } else if (anyRequiredUnknown) {
    result = "POTENTIALLY_ELIGIBLE";
  } else {
    result = "ELIGIBLE";
  }

  return { result, evaluations, missing };
}
