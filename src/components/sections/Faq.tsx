"use client";

import { useId, useState } from "react";
import { faqs } from "@/lib/content";
import { ChairIcon } from "@/components/ui/ChairIcon";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();

  return (
    <section id="faq" className="grid gap-3 px-(--gutter) py-[14vh] md:grid-cols-[1fr_1.4fr]">
      <div className="flex min-h-[420px] flex-col justify-between bg-bg-2 p-6 md:sticky md:top-6 md:h-[calc(100svh-3rem)]">
        <h2 className="display h-lg">Questions, answered</h2>
        <ChairIcon kind="flow" className="mx-auto w-2/5 text-fg opacity-80" />
        <p className="max-w-sm text-muted">
          Can&apos;t find what you need? Write to <a className="underline underline-offset-4" href="mailto:hello@sella.example">hello@sella.example</a>.
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          const id = `${base}-${i}`;
          return (
            <li key={f.q} className="bg-bg-2">
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={id}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-6 text-left text-lg font-medium tracking-tight"
                >
                  {f.q}
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-card text-xl transition-transform duration-500 ease-(--ease-out) data-[open=true]:rotate-45"
                    data-open={isOpen}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
              </h3>
              <div id={id} className="accordion" data-open={isOpen} role="region">
                <div>
                  <p className="max-w-prose px-6 pb-6 leading-relaxed text-muted">{f.a}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
