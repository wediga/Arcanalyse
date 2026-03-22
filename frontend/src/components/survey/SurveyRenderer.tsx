"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  FormbricksSurvey,
  FormbricksQuestion,
  FormbricksLogicBlock,
  FormbricksCondition,
  FormbricksConditionGroup,
} from "@/lib/formbricks";
import EmailCapture from "./EmailCapture";
import SurveyComplete from "./SurveyComplete";
import OpenText from "./questions/OpenText";
import MultipleChoiceSingle from "./questions/MultipleChoiceSingle";
import MultipleChoiceMulti from "./questions/MultipleChoiceMulti";
import Rating from "./questions/Rating";
import Consent from "./questions/Consent";

const FORMBRICKS_URL = process.env.NEXT_PUBLIC_FORMBRICKS_URL;
const FORMBRICKS_ENV_ID = process.env.NEXT_PUBLIC_FORMBRICKS_ENV_ID;
const LISTMONK_URL = process.env.NEXT_PUBLIC_LISTMONK_URL;
const LISTMONK_LIST_UUID = process.env.NEXT_PUBLIC_LISTMONK_LIST_UUID;

type Step =
  | { type: "email" }
  | { type: "question"; index: number }
  | { type: "email-retry" }
  | { type: "submitting" }
  | { type: "done" }
  | { type: "already-done" };

type Answers = Record<string, string | string[] | number>;

function evaluateCondition(
  condition: FormbricksCondition,
  answers: Answers,
): boolean {
  const left =
    condition.leftOperand.type === "question"
      ? answers[condition.leftOperand.value]
      : condition.leftOperand.value;
  const right = condition.rightOperand.value;

  switch (condition.operator) {
    case "equals":
      return Array.isArray(left) ? left.includes(right) : String(left) === String(right);
    case "notEquals":
      return Array.isArray(left) ? !left.includes(right) : String(left) !== String(right);
    case "greaterThan":
      return Number(left) > Number(right);
    case "lessThan":
      return Number(left) < Number(right);
    case "contains":
      return String(left).includes(right);
    case "notContains":
      return !String(left).includes(right);
    default:
      return false;
  }
}

function evaluateConditionGroup(
  group: FormbricksConditionGroup,
  answers: Answers,
): boolean {
  const results = group.conditions.map((c) => evaluateCondition(c, answers));
  return group.connector === "and"
    ? results.every(Boolean)
    : results.some(Boolean);
}

function resolveJumpTarget(
  logic: FormbricksLogicBlock[] | undefined,
  answers: Answers,
): string | null {
  if (!logic) return null;
  for (const block of logic) {
    if (evaluateConditionGroup(block.conditions, answers)) {
      const jump = block.actions.find((a) => a.objective === "jumpToQuestion");
      if (jump?.target) return jump.target;
    }
  }
  return null;
}

export default function SurveyRenderer({
  survey,
}: {
  survey: FormbricksSurvey;
}) {
  const [step, setStep] = useState<Step>({ type: "email" });
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState("");
  const [history, setHistory] = useState<number[]>([]);
  const [responseId, setResponseId] = useState<string | null>(null);

  const storageKey = `survey_progress_${survey.id}`;

  useEffect(() => {
    const done = localStorage.getItem(`survey_done_${survey.id}`);
    if (done) {
      setStep({ type: "already-done" });
      return;
    }

    // Restore progress
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        setAnswers(progress.answers ?? {});
        setHistory(progress.history ?? []);
        setResponseId(progress.responseId ?? null);
        setEmail(progress.email ?? "");
        if (typeof progress.questionIndex === "number") {
          setStep({ type: "question", index: progress.questionIndex });
          return;
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    }

    const savedEmail = localStorage.getItem("arcanalyse_email") ?? "";
    setEmail(savedEmail);
  }, [survey.id, storageKey]);

  const totalQuestions = survey.questions.length;

  const subscribeToListmonk = useCallback(async (subscriberEmail: string) => {
    if (!LISTMONK_URL || !LISTMONK_LIST_UUID || !subscriberEmail) return;
    try {
      await fetch(`${LISTMONK_URL}/api/public/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: subscriberEmail,
          name: "",
          list_uuids: [LISTMONK_LIST_UUID],
        }),
      });
    } catch {
      // Listmonk subscription is best-effort
    }
  }, []);

  function saveProgress(questionIndex: number, currentAnswers: Answers, currentHistory: number[]) {
    localStorage.setItem(storageKey, JSON.stringify({
      questionIndex,
      answers: currentAnswers,
      history: currentHistory,
      responseId,
      email,
    }));
  }

  async function sendPartialResponse(currentAnswers: Answers) {
    if (!FORMBRICKS_URL || !FORMBRICKS_ENV_ID) return;

    try {
      if (!responseId) {
        // Create new partial response
        const res = await fetch(
          `${FORMBRICKS_URL}/api/v1/client/${FORMBRICKS_ENV_ID}/responses`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              surveyId: survey.id,
              finished: false,
              data: currentAnswers,
            }),
          }
        );
        if (res.ok) {
          const json = await res.json();
          setResponseId(json.data?.id ?? null);
        }
      } else {
        // Update existing response
        await fetch(
          `${FORMBRICKS_URL}/api/v1/client/${FORMBRICKS_ENV_ID}/responses/${responseId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              finished: false,
              data: currentAnswers,
            }),
          }
        );
      }
    } catch {
      // Partial tracking is best-effort
    }
  }

  async function submitToFormbricks() {
    if (!FORMBRICKS_URL || !FORMBRICKS_ENV_ID) return;

    if (responseId) {
      // Finalize existing partial response
      const res = await fetch(
        `${FORMBRICKS_URL}/api/v1/client/${FORMBRICKS_ENV_ID}/responses/${responseId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            finished: true,
            data: answers,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to submit survey");
    } else {
      // No partial response yet, create a finished one
      const res = await fetch(
        `${FORMBRICKS_URL}/api/v1/client/${FORMBRICKS_ENV_ID}/responses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            surveyId: survey.id,
            finished: true,
            data: answers,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to submit survey");
    }
  }

  async function handleSubmit() {
    setStep({ type: "submitting" });
    setError("");

    try {
      await submitToFormbricks();
      localStorage.removeItem(storageKey);
      localStorage.setItem(`survey_done_${survey.id}`, "true");

      if (email) {
        localStorage.setItem("arcanalyse_email", email);
        await subscribeToListmonk(email);
        setStep({ type: "done" });
      } else {
        setStep({ type: "email-retry" });
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setStep({ type: "question", index: totalQuestions - 1 });
    }
  }

  function handleEmailSubmit(submittedEmail: string) {
    setEmail(submittedEmail);
    localStorage.setItem("arcanalyse_email", submittedEmail);
    if (step.type === "email") {
      setStep({ type: "question", index: 0 });
    } else if (step.type === "email-retry") {
      subscribeToListmonk(submittedEmail);
      setStep({ type: "done" });
    }
  }

  function handleEmailSkip() {
    setStep({ type: "question", index: 0 });
  }

  function handleEmailRetrySkip() {
    setStep({ type: "done" });
  }

  function setAnswer(questionId: string, value: string | string[] | number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function canAdvance(question: FormbricksQuestion): boolean {
    if (!question.required) return true;
    const val = answers[question.id];
    if (val === undefined || val === "") return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  }

  // Progress based on visited questions + remaining questions from current position.
  // Dynamically adjusts when skip logic reduces the total.
  const progressPercent =
    step.type === "email"
      ? 0
      : step.type === "question"
        ? ((history.length + 1) / (history.length + totalQuestions - step.index)) * 100
        : 100;

  // Render
  if (step.type === "already-done") {
    return (
      <SurveyComplete
        headline="Already completed"
        subtext="You've already taken this survey. Thank you for your feedback!"
      />
    );
  }

  if (step.type === "done") {
    const ending = survey.endings[0];
    return (
      <SurveyComplete
        headline={ending?.headline?.default}
        subtext={ending?.subheader?.default}
      />
    );
  }

  return (
    <div>
      {/* Progress bar */}
      {step.type !== "submitting" && (
        <div className="mb-10 h-0.5 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full bg-accent/40 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Email capture (initial) */}
      {step.type === "email" && (
        <EmailCapture
          email={email}
          onSubmit={handleEmailSubmit}
          onSkip={handleEmailSkip}
          introHeadline={survey.welcomeCard.enabled ? survey.welcomeCard.headline?.default : undefined}
          introHtml={survey.welcomeCard.enabled ? survey.welcomeCard.html?.default : undefined}
          logoUrl={survey.welcomeCard.enabled ? survey.welcomeCard.fileUrl || undefined : undefined}
        />
      )}

      {/* Email retry (after survey, no email given) */}
      {step.type === "email-retry" && (
        <EmailCapture
          email={email}
          onSubmit={handleEmailSubmit}
          onSkip={handleEmailRetrySkip}
          headline="Want to hear when Arcanalyse launches?"
          subtext="Drop your email and we'll keep you posted. No spam."
        />
      )}

      {/* Submitting */}
      {step.type === "submitting" && (
        <div className="py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
          <p className="mt-4 text-text-muted">Submitting your answers...</p>
        </div>
      )}

      {/* Question */}
      {step.type === "question" && (
        <QuestionStep
          question={survey.questions[step.index]}
          answers={answers}
          setAnswer={setAnswer}
          onBack={
            history.length === 0
              ? () => setStep({ type: "email" })
              : () => {
                  const prev = history[history.length - 1];
                  setHistory((h) => h.slice(0, -1));
                  setStep({ type: "question", index: prev });
                }
          }
          onNext={() => {
            sendPartialResponse(answers);
            const currentQuestion = survey.questions[step.index];
            const jumpTarget = resolveJumpTarget(currentQuestion.logic, answers);
            const newHistory = [...history, step.index];

            if (jumpTarget) {
              const targetIndex = survey.questions.findIndex((q) => q.id === jumpTarget);
              if (targetIndex !== -1) {
                setHistory(newHistory);
                if (targetIndex < totalQuestions) {
                  saveProgress(targetIndex, answers, newHistory);
                  setStep({ type: "question", index: targetIndex });
                } else {
                  handleSubmit();
                }
                return;
              }
            }

            if (step.index < totalQuestions - 1) {
              setHistory(newHistory);
              saveProgress(step.index + 1, answers, newHistory);
              setStep({ type: "question", index: step.index + 1 });
            } else {
              handleSubmit();
            }
          }}
          canAdvance={canAdvance(survey.questions[step.index])}
          isLast={step.index === totalQuestions - 1 || (() => {
            const jumpTarget = resolveJumpTarget(survey.questions[step.index].logic, answers);
            if (!jumpTarget) return false;
            return survey.questions.findIndex((q) => q.id === jumpTarget) >= totalQuestions;
          })()}
          error={error}
        />
      )}
    </div>
  );
}

function QuestionStep({
  question,
  answers,
  setAnswer,
  onBack,
  onNext,
  canAdvance,
  isLast,
  error,
}: {
  question: FormbricksQuestion;
  answers: Answers;
  setAnswer: (id: string, value: string | string[] | number) => void;
  onBack: () => void;
  onNext: () => void;
  canAdvance: boolean;
  isLast: boolean;
  error: string;
}) {
  const value = answers[question.id];

  return (
    <div>
      <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
        {question.headline.default}
      </h2>
      {question.subheader?.default && (
        <p className="mt-2 text-text-muted">{question.subheader.default}</p>
      )}

      <div className="mt-8">
        {question.type === "openText" && (
          <OpenText
            question={question}
            value={(value as string) ?? ""}
            onChange={(v) => setAnswer(question.id, v)}
          />
        )}

        {question.type === "multipleChoiceSingle" && (
          <MultipleChoiceSingle
            question={question}
            value={(value as string) ?? ""}
            onChange={(v) => setAnswer(question.id, v)}
          />
        )}

        {question.type === "multipleChoiceMulti" && (
          <MultipleChoiceMulti
            question={question}
            value={(value as string[]) ?? []}
            onChange={(v) => setAnswer(question.id, v)}
          />
        )}

        {question.type === "rating" && (
          <Rating
            question={question}
            value={(value as number) ?? 0}
            onChange={(v) => setAnswer(question.id, v)}
          />
        )}

        {question.type === "nps" && (
          <Rating
            question={{ ...question, range: 11 }}
            value={(value as number) ?? 0}
            onChange={(v) => setAnswer(question.id, v)}
          />
        )}

        {question.type === "consent" && (
          <Consent
            question={question}
            value={(value as string) ?? "dismissed"}
            onChange={(v) => setAnswer(question.id, v)}
          />
        )}

        {/* Fallback for unknown types */}
        {![
          "openText",
          "multipleChoiceSingle",
          "multipleChoiceMulti",
          "rating",
          "nps",
          "consent",
        ].includes(question.type) && (
          <OpenText
            question={question}
            value={(value as string) ?? ""}
            onChange={(v) => setAnswer(question.id, v)}
          />
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-10 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-text-muted transition-colors hover:text-text-primary"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canAdvance}
          className="rounded-full border border-accent/30 bg-accent/10 px-8 py-3 font-display text-sm tracking-widest text-accent uppercase transition-all hover:border-accent/60 hover:bg-accent/20 hover:shadow-[0_0_30px_-8px_rgba(226,181,90,0.3)] disabled:opacity-30 disabled:hover:border-accent/30 disabled:hover:bg-accent/10 disabled:hover:shadow-none"
        >
          {isLast ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
}
