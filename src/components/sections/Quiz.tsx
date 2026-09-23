"use client";

import { useState } from "react";
import { quiz, products } from "@/lib/content";
import { RollText } from "@/components/ui/RollText";
import { getLenis } from "@/components/providers/SmoothScroll";

// Answers that lean towards Flow (the rest lean towards Arc).
const flowLeaning = [
  [0, 2],
  [2, 3],
  [2, 3],
  [2],
];

function QuizPanel() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(quiz.map(() => null));
  const done = step >= quiz.length;
  const current = quiz[step];

  const flowScore = answers.reduce<number>((n, a, i) => n + (a !== null && flowLeaning[i].includes(a) ? 1 : 0), 0);
  const pick = products[flowScore >= 2 ? 1 : 0];

  const reset = () => {
    setStep(0);
    setAnswers(quiz.map(() => null));
  };

  if (done) {
    return (
      <div className="flex flex-col items-start gap-6" aria-live="polite">
        <p className="text-sm text-muted">Your match</p>
        <p className="display h-md">{pick.name}</p>
        <p className="max-w-md text-lg leading-snug text-muted">{pick.blurb}</p>
        <div className="flex gap-2">
          <a
            href="#chairs"
            onClick={(e) => {
              e.preventDefault();
              const lenis = getLenis();
              if (lenis) lenis.scrollTo("#chairs", { duration: 2 });
              else document.querySelector("#chairs")?.scrollIntoView();
            }}
            className="roll-host bg-fg px-6 py-3 text-sm font-medium text-bg"
          >
            <RollText text={`See ${pick.name.split(" ")[1]}`} />
          </a>
          <button type="button" onClick={reset} className="roll-host border border-line px-6 py-3 text-sm font-medium">
            <RollText text="Start again" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <fieldset>
      <legend className="mb-5 text-xl font-medium tracking-tight">{current.q}</legend>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {current.options.map((o, i) => (
          <label
            key={o}
            className="flex cursor-pointer items-center gap-3 bg-card px-4 py-4 transition-colors has-checked:bg-fg has-checked:text-bg"
          >
            <input
              type="radio"
              name={`q${step}`}
              className="size-4 accent-current"
              checked={answers[step] === i}
              onChange={() => setAnswers((a) => a.map((v, j) => (j === step ? i : v)))}
            />
            {o}
          </label>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          disabled={answers[step] === null}
          onClick={() => setStep((s) => s + 1)}
          className="roll-host bg-fg px-6 py-3 text-sm font-medium text-bg transition-opacity disabled:opacity-30"
        >
          <RollText text={`Next  ${step + 1}/${quiz.length}`} />
        </button>
        <div className="h-1 flex-1 overflow-hidden bg-bg-3" aria-hidden="true">
          <div className="h-full bg-fg transition-[width] duration-500 ease-(--ease-out)" style={{ width: `${(step / quiz.length) * 100}%` }} />
        </div>
      </div>
    </fieldset>
  );
}

function AskPanel() {
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <p className="text-xl leading-snug" aria-live="polite">
        Thanks — a real human from the studio will reply within one working day.
      </p>
    );
  }
  const field = "w-full bg-card px-4 py-3.5 placeholder:text-muted";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="grid gap-2 sm:grid-cols-2"
    >
      <label className="sr-only" htmlFor="ask-name">Name</label>
      <input id="ask-name" required autoComplete="name" placeholder="Your name" className={field} />
      <label className="sr-only" htmlFor="ask-email">Email</label>
      <input id="ask-email" required type="email" autoComplete="email" placeholder="Email" className={field} />
      <label className="sr-only" htmlFor="ask-msg">Question</label>
      <textarea id="ask-msg" required rows={4} placeholder="What would you like to know?" className={`${field} resize-none sm:col-span-2`} />
      <button type="submit" className="roll-host justify-self-start bg-fg px-6 py-3 text-sm font-medium text-bg">
        <RollText text="Send question" />
      </button>
    </form>
  );
}

export function Quiz() {
  const [tab, setTab] = useState<"quiz" | "ask">("quiz");
  return (
    <section className="px-(--gutter) py-[10vh]">
      <div className="bg-bg-2 p-6 md:p-10 lg:p-14">
        <div role="tablist" aria-label="Help choosing" className="mb-8 flex flex-wrap gap-x-8 gap-y-2">
          {(
            [
              ["quiz", "Find your chair"],
              ["ask", "Ask the studio"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className="display flex items-center gap-3 text-[clamp(1.5rem,3vw,2.5rem)] text-muted transition-colors aria-selected:text-fg"
            >
              <span className="size-3 border-2 border-current" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
        <div role="tabpanel">{tab === "quiz" ? <QuizPanel /> : <AskPanel />}</div>
      </div>
    </section>
  );
}
