"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormbricksSurvey, FormbricksQuestion } from "@/lib/formbricks";
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

export default function SurveyRenderer({
  survey,
}: {
  survey: FormbricksSurvey;
}) {
  const [step, setStep] = useState<Step>({ type: "email" });
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [error, setError] = useState("");

  useEffect(() => {
    const done = localStorage.getItem(`survey_done_${survey.id}`);
    if (done) {
      setStep({ type: "already-done" });
      return;
    }
    const savedEmail = localStorage.getItem("arcanalyse_email") ?? "";
    setEmail(savedEmail);
  }, [survey.id]);

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

  async function submitToFormbricks() {
    if (!FORMBRICKS_URL || !FORMBRICKS_ENV_ID) return;

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

    if (!res.ok) {
      throw new Error("Failed to submit survey");
    }
  }

  async function handleSubmit() {
    setStep({ type: "submitting" });
    setError("");

    try {
      await submitToFormbricks();
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

  // Progress indicator
  const progressSteps = totalQuestions + 1; // +1 for email
  const currentProgress =
    step.type === "email"
      ? 0
      : step.type === "question"
        ? step.index + 1
        : progressSteps;
  const progressPercent = (currentProgress / progressSteps) * 100;

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
            step.index === 0
              ? () => setStep({ type: "email" })
              : () => setStep({ type: "question", index: step.index - 1 })
          }
          onNext={
            step.index < totalQuestions - 1
              ? () => setStep({ type: "question", index: step.index + 1 })
              : handleSubmit
          }
          canAdvance={canAdvance(survey.questions[step.index])}
          isLast={step.index === totalQuestions - 1}
          stepLabel={`${step.index + 1} / ${totalQuestions}`}
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
  stepLabel,
  error,
}: {
  question: FormbricksQuestion;
  answers: Answers;
  setAnswer: (id: string, value: string | string[] | number) => void;
  onBack: () => void;
  onNext: () => void;
  canAdvance: boolean;
  isLast: boolean;
  stepLabel: string;
  error: string;
}) {
  const value = answers[question.id];

  return (
    <div>
      <p className="text-sm text-text-muted/60">{stepLabel}</p>
      <h2 className="mt-2 font-display text-2xl tracking-tight sm:text-3xl">
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
