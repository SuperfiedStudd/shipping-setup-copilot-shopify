"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  ArrowRight,
  CheckCircle,
  ClockCounterClockwise,
  Package,
  Storefront,
  Truck,
  Warning,
} from "@phosphor-icons/react";

import {
  blockerSequence,
  diagnoseFields,
  defaultState,
  phaseRail,
  presetOrder,
  presets,
  promptChips,
  promptOrder,
  stepOrder,
  storageKey,
  storeSignals,
  storyRail,
  type DemoState,
  type PresetId,
  type PromptId,
  type StepId,
} from "@/lib/shipping-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

function isStepId(value: unknown): value is StepId {
  return stepOrder.includes(value as StepId);
}

function isPromptId(value: unknown): value is PromptId {
  return promptOrder.includes(value as PromptId);
}

function isPresetId(value: unknown): value is PresetId {
  return presetOrder.includes(value as PresetId);
}

function readStoredState() {
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw) as Partial<DemoState>;

    return {
      activeStep: isStepId(parsed.activeStep) ? parsed.activeStep : defaultState.activeStep,
      blockerIndex:
        typeof parsed.blockerIndex === "number" &&
        parsed.blockerIndex >= 0 &&
        parsed.blockerIndex < blockerSequence.length
          ? parsed.blockerIndex
          : defaultState.blockerIndex,
      selectedPrompt: isPromptId(parsed.selectedPrompt)
        ? parsed.selectedPrompt
        : defaultState.selectedPrompt,
      selectedPreset: isPresetId(parsed.selectedPreset)
        ? parsed.selectedPreset
        : defaultState.selectedPreset,
    } satisfies DemoState;
  } catch {
    return defaultState;
  }
}

export function ShippingSetupCopilot() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const nudgeRef = useRef<HTMLDivElement | null>(null);
  const responseRef = useRef<HTMLDivElement | null>(null);
  const defaultsRef = useRef<HTMLDivElement | null>(null);
  const skipNextPersistRef = useRef(false);
  const [state, setState] = useState<DemoState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readStoredState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (skipNextPersistRef.current) {
      window.localStorage.removeItem(storageKey);
      skipNextPersistRef.current = false;
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [hydrated, state]);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-reveal='column']",
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out",
          stagger: 0.08,
        }
      );
    },
    { scope: rootRef }
  );

  useGSAP(
    () => {
      const targets = [nudgeRef.current, responseRef.current, defaultsRef.current].filter(Boolean);
      if (!targets.length) {
        return;
      }

      gsap.fromTo(
        targets,
        { opacity: 0.82, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.36,
          ease: "power2.out",
          stagger: 0.04,
          clearProps: "transform",
        }
      );
    },
    {
      scope: rootRef,
      dependencies: [state.activeStep, state.selectedPrompt, state.selectedPreset],
    }
  );

  const currentBlocker = blockerSequence[state.blockerIndex] ?? blockerSequence[0];

  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === state.selectedPreset) ?? presets[0],
    [state.selectedPreset]
  );

  const currentStepIndex = useMemo(
    () => phaseRail.findIndex((phase) => phase.id === state.activeStep),
    [state.activeStep]
  );

  const promptResponse = useMemo(() => {
    if (state.selectedPrompt === "review-package-details") {
      return {
        title: "Review missing package details.",
        body: "Product weight, package size, and fulfillment timing are still incomplete on 2 best sellers.",
      };
    }

    return {
      title: "Check default rate before launch.",
      body: `Test one small cart and one bulky cart before approving the ${selectedPreset.label.toLowerCase()} default.`,
    };
  }, [selectedPreset, state.selectedPrompt]);

  const resetDemo = () => {
    if (typeof window !== "undefined") {
      skipNextPersistRef.current = true;
      window.localStorage.removeItem(storageKey);
    }

    setState(defaultState);
  };

  const advanceDemo = () => {
    if (state.activeStep === "resume") {
      resetDemo();
      return;
    }

    setState((current) => {
      const nextIndex = Math.min(current.blockerIndex + 1, blockerSequence.length - 1);
      const nextBlocker = blockerSequence[nextIndex] ?? blockerSequence[blockerSequence.length - 1];

      return {
        ...current,
        blockerIndex: nextIndex,
        activeStep: nextBlocker.step,
      };
    });
  };

  return (
    <main
      id="main-content"
      className="ambient-page min-h-screen w-full max-w-full overflow-x-hidden bg-canvas text-ink"
    >
      <a className="skip-link" href="#demo-columns">
        Skip to content
      </a>

      <div
        ref={rootRef}
        className="mx-auto flex min-h-screen max-w-[1560px] flex-col px-4 py-4 sm:px-5 lg:px-5 lg:py-4"
      >
        <header className="mb-2 rounded-[16px] border border-line bg-white/95 px-5 py-2.5 shadow-hairline">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-line bg-[#f5f8f5]">
                <Truck className="h-5 w-5 text-accent" weight="fill" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold tracking-[-0.03em] text-ink">
                  Shipping Setup Copilot
                </p>
                <p className="text-sm leading-6 text-mutedInk">
                  Guided shipping setup for safer checkout rates.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#f5f5f2] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#59665f]">
                Single screen
              </span>
              <Button
                data-testid="reset-demo"
                size="sm"
                variant="secondary"
                onClick={resetDemo}
              >
                Reset demo
              </Button>
            </div>
          </div>
        </header>

        <section
          id="demo-columns"
          data-testid="three-column-layout"
          className="grid flex-1 gap-2 lg:min-h-0 lg:grid-cols-[minmax(220px,0.9fr)_minmax(420px,1.15fr)_minmax(320px,1fr)]"
        >
          <aside
            data-reveal="column"
            className="flex min-h-0 flex-col gap-3 rounded-[18px] border border-line bg-white p-3.5 shadow-hairline"
          >
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accentStrong">
                Two-minute story rail
              </p>
              <div className="rounded-[14px] border border-line bg-[#f8faf8] px-4 py-3">
                <p className="text-sm font-medium text-ink">Shopify APM prototype</p>
                <p className="mt-1 text-sm leading-6 text-mutedInk">
                  One screen that keeps incomplete shipping setup moving toward merchant approval.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {storyRail.map((item) => (
                <article key={item.label} className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accentStrong">
                    {item.label}
                  </p>
                  <p className="max-w-[28ch] text-sm leading-6 text-mutedInk">{item.text}</p>
                </article>
              ))}
              <div className="rounded-[16px] border border-line bg-[#f8faf8] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink">Demo state</p>
                    <p className="mt-1 text-sm leading-6 text-mutedInk">
                      One screen. Four guided steps.
                    </p>
                  </div>
                  <div className="rounded-[10px] border border-line bg-white px-3 py-2 text-sm font-medium text-ink">
                    {phaseRail[currentStepIndex]?.label ?? "Diagnose"}
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {phaseRail.map((phase, index) => {
                    const active = phase.id === state.activeStep;
                    const complete = index < currentStepIndex;

                    return (
                      <div
                        key={phase.id}
                        className={cn(
                          "flex items-center gap-3 rounded-[12px] border px-3 py-2.5 transition-colors",
                          active
                            ? "border-accent bg-accentSoft"
                            : "border-line bg-white"
                        )}
                      >
                        <div
                          className={cn(
                            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                            active
                              ? "border-accent bg-white text-accentStrong"
                              : complete
                                ? "border-[#b7d3c3] bg-white text-accentStrong"
                                : "border-line bg-[#f8faf8] text-mutedInk"
                          )}
                        >
                          {complete ? (
                            <CheckCircle className="h-4 w-4" weight="fill" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink">{phase.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          <section
            data-reveal="column"
            className="flex min-h-0 flex-col gap-2.5 rounded-[18px] border border-line bg-white p-3.5 shadow-hairline"
          >
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accentStrong">
                Diagnose setup gaps
              </p>
              <h1 className="max-w-[18ch] balance-lines text-[clamp(1.2rem,1.7vw,1.55rem)] font-semibold tracking-[-0.05em] text-ink">
                Bring the next shipping step into admin.
              </h1>
              <p className="max-w-[42ch] text-sm leading-5 text-mutedInk">
                One blocker, one simpler decision, and one faster path to safer checkout rates.
              </p>
            </div>

            <div
              ref={nudgeRef}
              data-testid="admin-nudge"
              className="rounded-[18px] border border-accent/20 bg-accentSoft p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/80 bg-white">
                    <Storefront className="h-5 w-5 text-accentStrong" weight="fill" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">Shopify admin</p>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-mutedInk">
                      Guided setup
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-white/80 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accentStrong">
                  {currentBlocker.eyebrow}
                </span>
              </div>

              <div className="mt-3 rounded-[16px] border border-white/80 bg-white p-3.5">
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px] sm:items-start">
                  <div className="min-w-0 max-w-[32ch]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accentStrong">
                      {phaseRail[currentStepIndex]?.label ?? "Diagnose"}
                    </p>
                    <h2 className="mt-2 max-w-[16ch] balance-lines text-[clamp(1.05rem,1.5vw,1.4rem)] font-semibold tracking-[-0.05em] text-ink">
                      {currentBlocker.headline}
                    </h2>
                    <p className="mt-2 text-sm font-medium text-ink">{currentBlocker.detail}</p>
                    <p className="mt-2 max-w-[34ch] text-sm leading-5 text-mutedInk">
                      {currentBlocker.helper}
                    </p>
                  </div>

                  <div className="rounded-[12px] border border-line bg-[#f8faf8] px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-mutedInk">
                      Suggested next step
                    </p>
                    <p className="mt-2 max-w-[16ch] text-sm font-medium leading-5 text-ink">
                      {currentBlocker.status}
                    </p>
                  </div>
                </div>

                {state.activeStep === "diagnose" ? (
                  <div className="mt-3 rounded-[16px] border border-line bg-[#f8faf8] p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mutedInk">
                          Quick edit
                        </p>
                        <p className="mt-1 text-sm leading-5 text-ink">
                          Add the missing shipping details without leaving admin.
                        </p>
                      </div>
                      <div className="rounded-full border border-line bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accentStrong">
                        Needs review
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {diagnoseFields.map((field) => (
                        <label key={field.label} className="space-y-1">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mutedInk">
                            {field.label}
                          </span>
                          <input
                            defaultValue={field.value}
                            className="w-full rounded-[12px] border border-line bg-white px-3 py-2 text-sm text-ink outline-none"
                            type="text"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                  <p className="text-sm leading-6 text-mutedInk">
                    Shopify keeps the next shipping decision visible right where the merchant is already working.
                  </p>
                  <Button data-testid="next-detail-button" onClick={advanceDemo}>
                    {currentBlocker.actionLabel}
                    <ArrowRight className="ml-2 h-4 w-4" weight="bold" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-[18px] border border-line bg-[#f8faf8] p-3.5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink">Daily setup nudge</p>
                  <p className="mt-1 max-w-[42ch] text-sm leading-6 text-mutedInk">
                    You still have 2 shipping details to confirm.
                  </p>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-mutedInk">
                  In admin
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {promptChips.map((chip) => {
                  const active = chip.id === state.selectedPrompt;

                  return (
                    <button
                      key={chip.id}
                      data-testid={`prompt-${chip.id}`}
                      type="button"
                      onClick={() =>
                        setState((current) => ({
                          ...current,
                          selectedPrompt: chip.id,
                        }))
                      }
                      className={cn(
                        "rounded-full border px-3 py-2 text-left text-sm transition-colors",
                        active
                          ? "border-accent bg-white text-accentStrong"
                          : "border-line bg-white text-mutedInk hover:border-[#bfd2c5] hover:text-ink"
                      )}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              <div
                ref={responseRef}
                data-testid="sidekick-response"
                className="mt-3 rounded-[16px] border border-line bg-white p-3.5"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mutedInk">
                  Next reminder
                </p>
                <p className="mt-2 text-sm font-medium text-ink">{promptResponse.title}</p>
                <p className="mt-1 max-w-[40ch] text-sm leading-5 text-mutedInk">
                  {promptResponse.body}
                </p>
                <p className="mt-3 text-sm leading-5 text-mutedInk">
                  Shopify can keep surfacing unfinished shipping setup in admin until the merchant signs off.
                </p>
              </div>
            </div>
          </section>

          <aside
            data-reveal="column"
            className="flex min-h-0 flex-col gap-2.5 rounded-[18px] border border-line bg-white p-3.5 shadow-hairline"
          >
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accentStrong">
                Safer default
              </p>
              <h2 className="max-w-[18ch] balance-lines text-[clamp(1.1rem,1.55vw,1.45rem)] font-semibold tracking-[-0.05em] text-ink">
                Start from a safer shipping default.
              </h2>
              <p className="max-w-[30ch] text-sm leading-5 text-mutedInk">
                Shopify narrows package, handling, and rate decisions from the store signals it already has.
              </p>
            </div>

            <div className="space-y-2" role="radiogroup" aria-label="Safer default options">
              {presets.map((preset) => {
                const active = preset.id === state.selectedPreset;

                return (
                  <label
                    key={preset.id}
                    data-testid={`preset-${preset.id}`}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-[14px] border px-4 py-4 transition-colors",
                      active
                        ? "border-accent bg-accentSoft"
                        : "border-line bg-[#f8faf8] hover:border-[#bfd2c5] hover:bg-white"
                    )}
                  >
                    <input
                      checked={active}
                      className="mt-1 h-4 w-4 accent-[#315f51]"
                      name="safer-default"
                      onChange={() =>
                        setState((current) => ({
                          ...current,
                          selectedPreset: preset.id,
                        }))
                      }
                      type="radio"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-medium text-ink">{preset.label}</p>
                        {active ? (
                          <span className="rounded-full border border-white/80 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accentStrong">
                            Selected
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm leading-5 text-mutedInk">{preset.summary}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="rounded-[16px] border border-line bg-[#f8faf8] p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mutedInk">
                What Shopify can use
              </p>
              <div className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2">
                {storeSignals.map((signal) => (
                  <div key={signal} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accentStrong" weight="fill" />
                    <p className="text-sm text-ink">{signal}</p>
                  </div>
                ))}
              </div>
            </div>

            <div
              ref={defaultsRef}
              data-testid="preset-defaults"
              className="rounded-[18px] border border-accent/20 bg-accentSoft p-3.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accentStrong">
                    Safer default for {selectedPreset.label}
                  </p>
                  <p className="mt-2 text-base font-medium tracking-[-0.03em] text-ink">
                    {selectedPreset.note}
                  </p>
                </div>
                <div className="rounded-[10px] border border-white/80 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-accentStrong">
                  Merchant approval
                </div>
              </div>

              <div className="mt-4 grid gap-x-5 gap-y-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-accentStrong">
                    <Package className="h-4 w-4" weight="duotone" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                      Package
                    </p>
                  </div>
                  <p className="text-sm font-medium leading-5 text-ink">
                    {selectedPreset.defaults.package}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-accentStrong">
                    <ClockCounterClockwise className="h-4 w-4" weight="duotone" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                      Handling
                    </p>
                  </div>
                  <p className="text-sm font-medium leading-5 text-ink">
                    {selectedPreset.defaults.handling}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-accentStrong">
                    <Truck className="h-4 w-4" weight="fill" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                      Rates
                    </p>
                  </div>
                  <p className="text-sm font-medium leading-5 text-ink">
                    {selectedPreset.defaults.rates}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-accentStrong">
                    <Warning className="h-4 w-4" weight="fill" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                      First check
                    </p>
                  </div>
                  <p className="text-sm font-medium leading-5 text-ink">
                    {selectedPreset.defaults.focus}
                  </p>
                </div>
              </div>

              <p className="mt-3 max-w-[30ch] text-sm leading-5 text-mutedInk">
                Shopify uses the available store signals to recommend a safer starting point, then waits for merchant approval before final changes.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
