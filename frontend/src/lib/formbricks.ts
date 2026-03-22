const FORMBRICKS_URL = process.env.NEXT_PUBLIC_FORMBRICKS_URL;
const API_KEY = process.env.FORMBRICKS_API_KEY;

export type FormbricksChoice = {
  id: string;
  label: { default: string };
};

export type FormbricksOperand = {
  type: "question" | "static" | "variable" | "hiddenField";
  value: string;
};

export type FormbricksCondition = {
  id: string;
  operator: "equals" | "notEquals" | "greaterThan" | "lessThan" | "contains" | "notContains";
  leftOperand: FormbricksOperand;
  rightOperand: FormbricksOperand;
};

export type FormbricksConditionGroup = {
  id: string;
  connector: "and" | "or";
  conditions: FormbricksCondition[];
};

export type FormbricksAction = {
  id: string;
  objective: "jumpToQuestion" | "calculate" | "requireAnswer" | "setVariable";
  target?: string;
};

export type FormbricksLogicBlock = {
  id: string;
  actions: FormbricksAction[];
  conditions: FormbricksConditionGroup;
};

export type FormbricksQuestion = {
  id: string;
  type: string;
  headline: { default: string };
  subheader?: { default: string };
  required: boolean;
  choices?: FormbricksChoice[];
  inputType?: string;
  placeholder?: { default: string };
  buttonLabel?: { default: string };
  range?: number;
  scale?: string;
  label?: { default: string };
  lowerLabel?: { default: string };
  upperLabel?: { default: string };
  html?: { default: string };
  logic?: FormbricksLogicBlock[];
};

export type FormbricksEnding = {
  id: string;
  type: string;
  headline?: { default: string };
  subheader?: { default: string };
};

export type FormbricksSurvey = {
  id: string;
  name: string;
  status: "draft" | "inProgress" | "completed" | "paused";
  questions: FormbricksQuestion[];
  welcomeCard: {
    enabled: boolean;
    headline?: { default: string };
    html?: { default: string };
    buttonLabel?: { default: string };
    fileUrl?: string;
  };
  endings: FormbricksEnding[];
};

export async function getSurveys(): Promise<FormbricksSurvey[]> {
  if (!FORMBRICKS_URL || !API_KEY) return [];

  const res = await fetch(`${FORMBRICKS_URL}/api/v1/management/surveys`, {
    headers: { "x-api-key": API_KEY },
    next: { revalidate: 300 },
  });

  if (!res.ok) return [];

  const json = await res.json();
  return (json.data ?? []).filter(
    (s: FormbricksSurvey) => s.status === "inProgress"
  );
}

export async function getSurvey(
  id: string
): Promise<FormbricksSurvey | null> {
  if (!FORMBRICKS_URL || !API_KEY) return null;

  const res = await fetch(
    `${FORMBRICKS_URL}/api/v1/management/surveys/${id}`,
    {
      headers: { "x-api-key": API_KEY },
      next: { revalidate: 300 },
    }
  );

  if (!res.ok) return null;

  const json = await res.json();
  return json.data;
}
