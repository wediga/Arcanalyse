const FORMBRICKS_URL = process.env.NEXT_PUBLIC_FORMBRICKS_URL;
const API_KEY = process.env.FORMBRICKS_API_KEY;

export type FormbricksChoice = {
  id: string;
  label: { default: string };
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
  html?: { default: string };
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
