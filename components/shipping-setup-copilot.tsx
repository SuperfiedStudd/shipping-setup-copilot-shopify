"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  ArrowRight,
  CheckCircle,
  ClockCounterClockwise,
  GlobeHemisphereWest,
  Package,
  Storefront,
  TestTube,
  TrendUp,
  Truck,
  Warning,
} from "@phosphor-icons/react";

import {
  configureSettings,
  defaultState,
  destinations,
  diagnoseBlockers,
  focusOrder,
  merchantArchetype,
  recommendationAlternatives,
  recommendationHighlights,
  sampleCarts,
  stepRail,
  storyRail,
  storageKey,
  type ConfigureFocusId,
  type PrototypeState,
  type StepId,
} from "@/lib/shipping-data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

gsap.registerPlugin(useGSAP);

type TesterResult = {
  status: "ok" | "warning" | "failed";
  headline: string;
  explanation: string;
  customerRates: string[];
  reasoning: string[];
};

function readStoredState() {
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return defaultState;
    }

    return {
      ...defaultState,
      ...JSON.parse(raw),
    } as PrototypeState;
  } catch {
    return defaultState;
  }
}

function isCompletedStep(stepId: StepId, state: PrototypeState) {
  if (stepId === "diagnose") {
    return state.activeStep !== "diagnose" || state.approvedRecommendation;
  }

  if (stepId === "recommend") {
    return state.approvedRecommendation;
  }

  if (stepId === "configure") {
    return state.hasTestedRates;
  }

  return state.activeStep === "resume";
}

function testerBadge(status: TesterResult["status"]) {
  if (status === "ok") return "success" as const;
  if (status === "warning") return "warn" as const;
  return "danger" as const;
}

function stepIcon(stepId: StepId) {
  if (stepId === "diagnose") {
    return <Warning className="h-4 w-4" weight="fill" />;
  }

  if (stepId === "recommend") {
    return <TrendUp className="h-4 w-4" weight="duotone" />;
  }

  if (stepId === "configure") {
    return <Package className="h-4 w-4" weight="duotone" />;
  }

  return <ClockCounterClockwise className="h-4 w-4" weight="duotone" />;
}

function buildTesterResult(state: PrototypeState): TesterResult {
  const hasWeights = state.confirmedSettings.includes("weights");
  const hasPackage = state.confirmedSettings.includes("package");
  const hasCarrier = state.confirmedSettings.includes("carrier");
  const domestic = state.selectedDestination === "los-angeles-ca";
  const lightCart = state.selectedCart === "planter-pair";

  if (lightCart && domestic) {
    if (hasWeights && hasPackage) {
      return {
        status: "ok",
        headline: "Rates appear cleanly",
        explanation:
          "The product facts and default parcel are strong enough for a believable domestic quote.",
        customerRates: ["USPS Ground - $8.90", "UPS Ground - $11.70"],
        reasoning: [
          "Draft dimensions already cover the common planter shape.",
          "The default package gives checkout a stable parcel baseline.",
          "Processing time stays aligned with the current 2 to 3 day promise.",
        ],
      };
    }

    return {
      status: "warning",
      headline: "Rate appears with caution",
      explanation:
        "Checkout can still estimate a price, but draft sizes or no default box make the result less trustworthy.",
      customerRates: ["Estimated parcel rate - $10.20"],
      reasoning: [
        hasWeights ? "Weight bands are present." : "Missing weight bands force a broad estimate.",
        hasPackage ? "A default package is saved." : "No default package means checkout is guessing parcel shape.",
        "The merchant still needs to confirm the basics before turning shipping on.",
      ],
    };
  }

  if (lightCart && !domestic) {
    if (hasWeights && hasPackage && hasCarrier) {
      return {
        status: "warning",
        headline: "Cross-border rate appears",
        explanation:
          "The quote is ready enough to show, but the merchant should still approve the exact carrier and fallback plan.",
        customerRates: ["UPS Standard - $22.40"],
        reasoning: [
          "Catalog size data is present for the parcel.",
          "The default package fits the order footprint.",
          "A local carrier plan exists, but the merchant still owns final approval.",
        ],
      };
    }

    return {
      status: "failed",
      headline: "No cross-border rate yet",
      explanation:
        "This cart needs confirmed product facts, a saved package, and a carrier setup before checkout can quote safely.",
      customerRates: ["Rate unavailable"],
      reasoning: [
        hasWeights ? "Weight bands are present." : "Product dimensions are still missing.",
        hasPackage ? "Package default is present." : "No saved default package is available.",
        hasCarrier ? "Carrier provider is present." : "No carrier account or provider is confirmed.",
      ],
    };
  }

  if (!lightCart && domestic) {
    if (hasWeights && hasPackage && hasCarrier) {
      return {
        status: "ok",
        headline: "Large-item rate appears",
        explanation:
          "The larger mirror bundle now has enough structure for a believable live domestic quote.",
        customerRates: ["UPS Ground - $24.80", "FedEx Home Delivery - $28.10"],
        reasoning: [
          "Bulky-item dimensions are covered by the draft sizing band.",
          "The default package logic is saved, with oversized items still flagged for review.",
          "A carrier provider is in place for the heavier shipment.",
        ],
      };
    }

    if (hasWeights && hasPackage) {
      return {
        status: "warning",
        headline: "Rate is still fragile",
        explanation:
          "The merchant has enough product and package detail, but the provider choice still needs confirmation.",
        customerRates: ["Fallback estimate - $26.90"],
        reasoning: [
          "The cart can estimate its parcel size.",
          "The default package exists for the common case.",
          "Carrier setup is still missing, so checkout falls back to a less reliable estimate.",
        ],
      };
    }

    return {
      status: "failed",
      headline: "Large-item quote fails",
      explanation:
        "This bundle exposes the exact problem the setup flow is trying to solve: missing facts turn live shipping into guesswork.",
      customerRates: ["Rate unavailable"],
      reasoning: [
        hasWeights ? "Weights are present." : "Large-item weights and dimensions are still incomplete.",
        hasPackage ? "Package default is saved." : "No default package is available for parcel logic.",
        hasCarrier ? "Carrier plan is present." : "Carrier provider is still missing.",
      ],
    };
  }

  if (hasWeights && hasPackage && hasCarrier) {
    return {
      status: "warning",
      headline: "Cross-border live rate appears",
      explanation:
        "The quote works, but this is where Shopify should still show the merchant why the result is narrower and more expensive.",
      customerRates: ["UPS Worldwide Saver - $41.60"],
      reasoning: [
        "Oversized item dimensions are known.",
        "The default package logic is saved for the most common parcel.",
        "A carrier provider is in place, but international checkout remains the most sensitive case.",
      ],
    };
  }

  return {
    status: "failed",
    headline: "International quote fails",
    explanation:
      "A mixed-size mirror cart going to Canada is the fastest way to prove why guided setup matters.",
    customerRates: ["Rate unavailable"],
    reasoning: [
      hasWeights ? "Weight data exists." : "Product weight and dimension gaps still block the quote.",
      hasPackage ? "Default package exists." : "No saved package baseline is available for checkout.",
      hasCarrier ? "Carrier provider is present." : "Carrier provider still needs merchant approval.",
    ],
  };
}

export function ShippingSetupCopilot() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const progressFillRef = useRef<HTMLDivElement | null>(null);
  const nudgeRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<PrototypeState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readStoredState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [hydrated, state]);

  const activeSetting = useMemo(
    () => configureSettings.find((setting) => setting.id === state.configureFocus)!,
    [state.configureFocus]
  );

  const completionCount = useMemo(
    () =>
      [
        state.approvedRecommendation,
        state.confirmedSettings.includes("weights"),
        state.confirmedSettings.includes("package"),
        state.hasTestedRates,
      ].filter(Boolean).length,
    [state.approvedRecommendation, state.confirmedSettings, state.hasTestedRates]
  );

  const completionPercent = useMemo(
    () => Math.round((completionCount / 4) * 100),
    [completionCount]
  );

  const previewNudgeCount = 2;

  const testerResult = useMemo(() => buildTesterResult(state), [state]);

  const resumeTargetLabel = useMemo(() => {
    if (state.lastLiveStep === "configure") {
      return activeSetting.title;
    }

    return stepRail.find((step) => step.id === state.lastLiveStep)?.label ?? "Configure";
  }, [activeSetting.title, state.lastLiveStep]);

  useGSAP(
    () => {
      if (stageRef.current) {
        gsap.fromTo(
          stageRef.current.querySelectorAll("[data-animate='stage']"),
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.46,
            ease: "power2.out",
            stagger: 0.05,
          }
        );
      }

      if (progressFillRef.current) {
        gsap.to(progressFillRef.current, {
          width: `${completionPercent}%`,
          duration: 0.5,
          ease: "power2.out",
        });
      }

      if (nudgeRef.current) {
        gsap.killTweensOf(nudgeRef.current);
        gsap.fromTo(
          nudgeRef.current,
          { opacity: 0.9, y: 6 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
          }
        );
      }
    },
    {
      scope: rootRef,
      dependencies: [
        completionPercent,
        state.activeStep,
        state.configureFocus,
        state.hasTestedRates,
        state.testerOpen,
      ],
    }
  );

  const openStep = (stepId: StepId) => {
    setState((current) => ({
      ...current,
      activeStep: stepId,
      lastLiveStep: stepId === "resume" ? current.lastLiveStep : stepId,
      testerOpen: stepId === "configure" ? current.testerOpen : false,
    }));
  };

  const advanceFromDiagnose = () => {
    setState((current) => ({
      ...current,
      activeStep: "recommend",
      lastLiveStep: "recommend",
    }));
  };

  const approveStartingPoint = () => {
    setState((current) => ({
      ...current,
      approvedRecommendation: true,
      activeStep: "configure",
      lastLiveStep: "configure",
    }));
  };

  const confirmSetting = (settingId: ConfigureFocusId) => {
    setState((current) => {
      if (current.confirmedSettings.includes(settingId)) {
        return current;
      }

      const nextFocus =
        focusOrder[focusOrder.findIndex((item) => item === settingId) + 1] ?? settingId;

      return {
        ...current,
        confirmedSettings: [...current.confirmedSettings, settingId],
        configureFocus: nextFocus,
      };
    });
  };

  const testCheckoutRates = () => {
    setState((current) => ({
      ...current,
      testerOpen: true,
      hasTestedRates: true,
    }));
  };

  const previewResumeState = () => {
    setState((current) => ({
      ...current,
      activeStep: "resume",
    }));
  };

  const resumeSetup = () => {
    setState((current) => ({
      ...current,
      activeStep: current.lastLiveStep,
    }));
  };

  return (
    <main
      id="main-content"
      className="ambient-page min-h-screen w-full max-w-full overflow-x-hidden bg-canvas text-ink lg:overflow-hidden"
    >
      <a className="skip-link" href="#prototype-shell">
        Skip to content
      </a>

      <div
        ref={rootRef}
        className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-5 lg:h-screen lg:max-h-screen lg:gap-5 lg:px-5 lg:py-5"
      >
        <header className="rounded-[24px] border border-line bg-white px-5 py-5 shadow-hairline sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-[#f4f7f4]">
                <Truck className="h-6 w-6 text-accent" weight="fill" />
              </div>
              <div className="space-y-1">
                <p className="text-[clamp(1.35rem,2.6vw,1.85rem)] font-semibold leading-none tracking-[-0.04em] text-ink">
                  Shipping Setup Copilot
                </p>
                <p className="text-sm text-mutedInk">Shopify APM Take-Home Prototype</p>
                <p className="text-sm text-mutedInk">Built by Jasjyot Singh</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success" className="px-3 py-1.5 text-[11px]">
                Single-screen interactive prototype
              </Badge>
              <Badge variant="neutral" className="px-3 py-1.5 text-[11px]">
                Local mock data only
              </Badge>
              <Button variant="ghost" size="sm" onClick={previewResumeState}>
                Preview resume state
              </Button>
            </div>
          </div>
        </header>

        <section
          id="prototype-shell"
          className="grid flex-1 gap-4 overflow-hidden lg:grid-cols-[minmax(280px,0.92fr)_minmax(0,2.58fr)]"
        >
          <aside className="h-full rounded-[28px] border border-line bg-white px-5 py-5 shadow-hairline lg:overflow-y-auto lg:px-6">
            <div className="space-y-6">
              <div className="space-y-3" data-animate="stage">
                <Badge variant="neutral" className="w-fit px-3 py-1.5 text-[11px]">
                  Two-minute story rail
                </Badge>
                <div className="space-y-3">
                  {storyRail.map((item) => (
                    <div key={item.label} className="space-y-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                        {item.label}
                      </p>
                      <p className="text-sm leading-6 text-mutedInk">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3" data-animate="stage">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium tracking-[-0.02em] text-ink">Demo steps</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-mutedInk">
                    {completionPercent}% complete
                  </p>
                </div>
                <div className="space-y-2">
                  {stepRail.map((step, index) => {
                    const active = state.activeStep === step.id;
                    const complete = isCompletedStep(step.id, state);

                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => openStep(step.id)}
                        className={cn(
                          "w-full rounded-2xl border px-4 py-3 text-left transition-all duration-200",
                          active
                            ? "border-accent bg-accentSoft"
                            : "border-line bg-[#f8faf8] hover:border-[#c7d4cb] hover:bg-white"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-sm font-medium",
                              active
                                ? "border-accent bg-white text-accent"
                                : complete
                                  ? "border-[#b7d3c3] bg-white text-accentStrong"
                                  : "border-line bg-white text-mutedInk"
                            )}
                          >
                            {complete && !active ? (
                              <CheckCircle className="h-4 w-4" weight="fill" />
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-ink">{step.label}</p>
                              {active ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
                                  {stepIcon(step.id)}
                                  Live
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-sm leading-6 text-mutedInk">{step.summary}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[22px] border border-line bg-[#f8faf8] p-4" data-animate="stage">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-ink">Completion state</p>
                    <p className="mt-1 text-sm leading-6 text-mutedInk">
                      Merchant story, starting point, and testing proof all live on one screen.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-line bg-white px-3 py-2 text-right">
                    <p className="text-[11px] uppercase tracking-[0.15em] text-mutedInk">Progress</p>
                    <p className="mt-1 text-xl font-semibold tracking-[-0.04em] text-ink">
                      {completionPercent}%
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#dfe7df]">
                  <div
                    ref={progressFillRef}
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>

              <div
                ref={nudgeRef}
                data-nudge-preview
                className="rounded-[24px] border border-accent/10 bg-accentSoft p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white">
                    <Truck className="h-5 w-5 text-accent" weight="fill" />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <p className="text-sm font-medium tracking-[-0.02em] text-ink">
                      Persistent shipping nudge preview
                    </p>
                    <div className="rounded-2xl border border-white/80 bg-white px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.15em] text-mutedInk">
                        Shopify admin message
                      </p>
                      <p className="mt-2 text-lg font-medium tracking-[-0.03em] text-ink">
                        {previewNudgeCount} shipping details left
                      </p>
                      <p className="mt-1 text-sm leading-6 text-mutedInk">
                        Resume from {resumeTargetLabel.toLowerCase()} instead of restarting shipping
                        setup from scratch.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <section className="flex h-full flex-col overflow-hidden rounded-[30px] border border-line bg-white shadow-[0_18px_60px_rgba(23,33,27,0.08)]">
            <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#dbe5dd]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#dbe5dd]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#dbe5dd]" />
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-ink">Homefront Supply</p>
                <p className="text-xs uppercase tracking-[0.16em] text-mutedInk">
                  Shipping and delivery
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="neutral">One screen</Badge>
                {state.activeStep === "resume" ? (
                  <Button variant="ghost" size="sm" onClick={resumeSetup}>
                    Return to setup
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={previewResumeState}>
                    Merchant leaves now
                  </Button>
                )}
              </div>
            </div>

            <div
              ref={stageRef}
              className="prototype-grid prototype-glow flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8"
            >
              {state.activeStep === "diagnose" ? (
                <div className="space-y-6">
              <div className="space-y-4" data-animate="stage">
                <Badge variant="danger" className="w-fit px-3 py-1.5 text-[11px]">
                  Diagnose
                </Badge>
                <div className="max-w-4xl space-y-4">
                      <h2 className="max-w-[14ch] text-[clamp(2.6rem,5vw,4.5rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-ink">
                        Shipping setup is incomplete.
                      </h2>
                      <p className="max-w-3xl text-base leading-7 text-mutedInk">
                        Shopify already offers the shipping tools. The problem is that small
                        merchants may not know which missing detail across product data, packages,
                        shipping settings, carrier setup, markets, or guidance is actually blocking
                        trustworthy checkout rates.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_320px]">
                    <Card className="bg-white" data-animate="stage">
                      <CardHeader>
                        <CardDescription>Only the blockers that matter right now</CardDescription>
                        <CardTitle className="mt-2 text-2xl tracking-[-0.04em]">
                          Three things are holding the merchant back
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {diagnoseBlockers.map((blocker) => (
                          <div
                            key={blocker.id}
                            className="rounded-2xl border border-line bg-[#f8faf8] px-4 py-4"
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-paleRed text-paleRedInk">
                                <Warning className="h-4 w-4" weight="fill" />
                              </div>
                              <div>
                                <p className="text-base font-medium tracking-[-0.02em] text-ink">
                                  {blocker.title}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-mutedInk">
                                  {blocker.detail}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-[#f8faf8]" data-animate="stage">
                      <CardHeader>
                        <CardDescription>Why this framing matters</CardDescription>
                        <CardTitle className="mt-2 text-xl tracking-[-0.03em]">
                          Less setup noise, faster confidence
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm leading-6 text-mutedInk">
                        <p>
                          Many Shopify merchants are still deciding packaging, carriers, markets,
                          and fulfillment habits while the store is already going live.
                        </p>
                        <p>
                          A good rescue flow should narrow the problem before it sends the merchant
                          deeper into scattered shipping settings, apps, or carrier setup.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div
                    className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-line bg-white/96 px-4 py-4 backdrop-blur"
                    data-animate="stage"
                  >
                    <p className="max-w-2xl text-sm leading-6 text-mutedInk">
                      The prototype intentionally stops at three blockers so the merchant sees a
                      product story, not a dashboard.
                    </p>
                    <Button size="lg" onClick={advanceFromDiagnose}>
                      Start guided setup
                      <ArrowRight className="ml-2 h-4 w-4" weight="bold" />
                    </Button>
                  </div>
                </div>
              ) : null}

              {state.activeStep === "recommend" ? (
                <div className="space-y-6">
                  <div className="space-y-4" data-animate="stage">
                    <Badge variant="info" className="w-fit px-3 py-1.5 text-[11px]">
                      Recommend
                    </Badge>
                    <div className="max-w-4xl space-y-4">
                      <h2 className="max-w-[15ch] text-[clamp(2.4rem,4.6vw,4.2rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-ink">
                        Start with smart defaults from store signals.
                      </h2>
                      <p className="max-w-3xl text-base leading-7 text-mutedInk">
                        This flow does not invent a new shipping product. It unifies existing
                        Shopify shipping surfaces into one visible recommendation path, makes the
                        reasoning clear, and waits for merchant approval before anything final is
                        accepted.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_320px]">
                    <Card className="bg-white" data-animate="stage">
                      <CardHeader>
                        <Badge variant="neutral" className="w-fit">
                          Merchant archetype
                        </Badge>
                        <CardTitle className="mt-3 text-2xl tracking-[-0.04em]">
                          {merchantArchetype.name}
                        </CardTitle>
                        <CardDescription>{merchantArchetype.detail}</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-3 md:grid-cols-2">
                        {recommendationHighlights.map((item) => (
                          <div
                            key={item.label}
                            className="rounded-2xl border border-line bg-[#f8faf8] px-4 py-4"
                          >
                            <p className="text-[11px] uppercase tracking-[0.15em] text-mutedInk">
                              {item.label}
                            </p>
                            <p className="mt-2 text-base font-medium tracking-[-0.02em] text-ink">
                              {item.value}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-mutedInk">{item.note}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <div className="space-y-4">
                      <Card className="bg-[#f8faf8]" data-animate="stage">
                        <CardHeader>
                          <CardDescription>Existing capabilities, clearer framing</CardDescription>
                          <CardTitle className="mt-2 text-xl tracking-[-0.03em]">
                            Merchant approval stays explicit
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm leading-6 text-mutedInk">
                          Smart defaults from store signals are a proposed starting point only.
                          Shipping profiles, carrier-calculated rates, backup logic, packages,
                          markets, and guidance already exist. This prototype makes them easier to
                          understand and approve in one place.
                        </CardContent>
                      </Card>

                      <Card className="bg-white" data-animate="stage">
                        <CardHeader>
                          <CardDescription>Alternatives Shopify deprioritizes</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {recommendationAlternatives.map((item) => (
                            <div key={item.title} className="rounded-2xl border border-line px-4 py-3">
                              <p className="text-sm font-medium text-ink">{item.title}</p>
                              <p className="mt-1 text-sm leading-6 text-mutedInk">{item.detail}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div
                    className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-line bg-white/96 px-4 py-4 backdrop-blur"
                    data-animate="stage"
                  >
                    <p className="max-w-2xl text-sm leading-6 text-mutedInk">
                      The prototype recommends local carriers first because the store ships from the
                      US and already has multiple existing Shopify shipping options competing for the
                      merchant's attention.
                    </p>
                    <Button size="lg" onClick={approveStartingPoint}>
                      Approve starting point
                      <ArrowRight className="ml-2 h-4 w-4" weight="bold" />
                    </Button>
                  </div>
                </div>
              ) : null}

              {state.activeStep === "configure" ? (
                <div className="space-y-6">
                  <div className="space-y-4" data-animate="stage">
                    <Badge variant="success" className="w-fit px-3 py-1.5 text-[11px]">
                      Configure
                    </Badge>
                    <div className="max-w-4xl space-y-4">
                      <h2 className="max-w-[15ch] text-[clamp(2.4rem,4.6vw,4.2rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-ink">
                        Confirm one shipping setting at a time.
                      </h2>
                      <p className="max-w-3xl text-base leading-7 text-mutedInk">
                        The merchant stays in one focused panel, sees why each existing Shopify
                        setting matters, and can test checkout rates without losing the thread.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2" data-animate="stage">
                    {configureSettings.map((setting, index) => {
                      const active = state.configureFocus === setting.id;
                      const confirmed = state.confirmedSettings.includes(setting.id);

                      return (
                        <button
                          key={setting.id}
                          type="button"
                          onClick={() =>
                            setState((current) => ({
                              ...current,
                              configureFocus: setting.id,
                            }))
                          }
                          className={cn(
                            "rounded-2xl border px-4 py-3 text-left transition-all duration-200",
                            active
                              ? "border-accent bg-accentSoft"
                              : "border-line bg-white hover:border-[#c7d4cb] hover:bg-[#f8faf8]"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] uppercase tracking-[0.15em] text-mutedInk">
                              Setting {index + 1}
                            </span>
                            {confirmed ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-accentStrong">
                                <CheckCircle className="h-3.5 w-3.5" weight="fill" />
                                Ready
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm font-medium text-ink">{setting.title}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_320px]">
                    <Card className="bg-white" data-animate="stage">
                      <CardHeader>
                        <CardDescription>Current setting</CardDescription>
                        <CardTitle className="mt-2 text-2xl tracking-[-0.04em]">
                          {activeSetting.title}
                        </CardTitle>
                        <CardDescription>{activeSetting.helper}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="rounded-2xl border border-line bg-[#f8faf8] px-4 py-4">
                          <p className="text-[11px] uppercase tracking-[0.15em] text-mutedInk">
                            Suggested default
                          </p>
                          <p className="mt-2 text-base font-medium tracking-[-0.02em] text-ink">
                            {activeSetting.previewValue}
                          </p>
                        </div>

                        <div className="space-y-3">
                          {activeSetting.lines.map((line) => (
                            <div
                              key={line}
                              className="rounded-2xl border border-line px-4 py-3 text-sm leading-6 text-ink"
                            >
                              {line}
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <Button
                            variant={
                              state.confirmedSettings.includes(activeSetting.id)
                                ? "secondary"
                                : "default"
                            }
                            onClick={() => confirmSetting(activeSetting.id)}
                          >
                            {state.confirmedSettings.includes(activeSetting.id)
                              ? "Setting marked ready"
                              : activeSetting.confirmLabel}
                          </Button>
                          <p className="text-sm leading-6 text-mutedInk">
                            Confirmation is local mock state only for this prototype.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-4">
                      <Card className="bg-[#f8faf8]" data-animate="stage">
                        <CardHeader>
                          <CardDescription>Why it matters</CardDescription>
                          <CardTitle className="mt-2 text-xl tracking-[-0.03em]">
                            Reduce bad defaults before launch
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm leading-6 text-mutedInk">
                          {activeSetting.whyItMatters}
                        </CardContent>
                      </Card>

                      <Card className="bg-white" data-animate="stage">
                        <CardHeader>
                          <CardDescription>Proof orientation</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm leading-6 text-mutedInk">
                          <p>
                            The checkout tester below is small on purpose. It is there to prove
                            which missing detail is blocking an accurate rate, not to become a
                            second dashboard.
                          </p>
                          <button
                            type="button"
                            onClick={previewResumeState}
                            className="inline-flex items-center gap-2 font-medium text-accent transition-colors hover:text-accentStrong"
                          >
                            Preview leave-and-resume behavior
                            <ArrowRight className="h-4 w-4" weight="bold" />
                          </button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <Card className="bg-white" data-animate="stage">
                    <CardHeader>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <CardDescription>Checkout rate tester</CardDescription>
                          <CardTitle className="mt-2 text-2xl tracking-[-0.04em]">
                            Two carts, two destinations, one reason for the result
                          </CardTitle>
                        </div>
                        <Badge variant="neutral">
                          <TestTube className="mr-1 h-3.5 w-3.5" weight="duotone" />
                          Proof mode
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="space-y-3">
                          <p className="text-[11px] uppercase tracking-[0.15em] text-mutedInk">
                            Sample carts
                          </p>
                          <div className="grid gap-3">
                            {sampleCarts.map((cart) => {
                              const selected = state.selectedCart === cart.id;
                              return (
                                <button
                                  key={cart.id}
                                  type="button"
                                  onClick={() =>
                                    setState((current) => ({
                                      ...current,
                                      selectedCart: cart.id,
                                    }))
                                  }
                                  className={cn(
                                    "rounded-2xl border px-4 py-4 text-left transition-all duration-200",
                                    selected
                                      ? "border-accent bg-accentSoft"
                                      : "border-line bg-[#f8faf8] hover:bg-white"
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <p className="text-base font-medium tracking-[-0.02em] text-ink">
                                      {cart.label}
                                    </p>
                                    <span className="text-sm font-medium text-mutedInk">
                                      {cart.weight}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-sm leading-6 text-mutedInk">
                                    {cart.contents}
                                  </p>
                                  <p className="mt-2 text-sm font-medium text-ink">{cart.value}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[11px] uppercase tracking-[0.15em] text-mutedInk">
                            Destinations
                          </p>
                          <div className="grid gap-3">
                            {destinations.map((destination) => {
                              const selected = state.selectedDestination === destination.id;
                              return (
                                <button
                                  key={destination.id}
                                  type="button"
                                  onClick={() =>
                                    setState((current) => ({
                                      ...current,
                                      selectedDestination: destination.id,
                                    }))
                                  }
                                  className={cn(
                                    "rounded-2xl border px-4 py-4 text-left transition-all duration-200",
                                    selected
                                      ? "border-accent bg-accentSoft"
                                      : "border-line bg-[#f8faf8] hover:bg-white"
                                  )}
                                >
                                  <p className="text-[11px] uppercase tracking-[0.15em] text-mutedInk">
                                    {destination.note}
                                  </p>
                                  <p className="mt-2 text-base font-medium tracking-[-0.02em] text-ink">
                                    {destination.label}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-line bg-[#f8faf8] p-4">
                        {state.testerOpen ? (
                          <div className="space-y-4">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <Badge variant={testerBadge(testerResult.status)} className="w-fit">
                                  {testerResult.headline}
                                </Badge>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-ink">
                                  {testerResult.explanation}
                                </p>
                              </div>
                              <div className="rounded-2xl border border-line bg-white px-4 py-3">
                                <p className="text-[11px] uppercase tracking-[0.15em] text-mutedInk">
                                  Result
                                </p>
                                <p className="mt-2 text-base font-medium capitalize text-ink">
                                  {testerResult.status}
                                </p>
                              </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                              <div className="space-y-3">
                                <p className="text-[11px] uppercase tracking-[0.15em] text-mutedInk">
                                  Customer-facing rates
                                </p>
                                {testerResult.customerRates.map((rate) => (
                                  <div
                                    key={rate}
                                    className="rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink"
                                  >
                                    {rate}
                                  </div>
                                ))}
                              </div>

                              <div className="space-y-3">
                                <p className="text-[11px] uppercase tracking-[0.15em] text-mutedInk">
                                  Why this appears or fails
                                </p>
                                {testerResult.reasoning.map((item) => (
                                  <div
                                    key={item}
                                    className="rounded-2xl border border-line bg-white px-4 py-3 text-sm leading-6 text-ink"
                                  >
                                    {item}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-medium text-ink">
                                Test the selected cart in the selected destination.
                              </p>
                              <p className="mt-1 text-sm leading-6 text-mutedInk">
                                The result will explain why a rate appears or fails based on the
                                current setup state across existing Shopify shipping pieces.
                              </p>
                            </div>
                            <div className="rounded-2xl border border-dashed border-line bg-white px-4 py-3 text-sm text-mutedInk">
                              Waiting for a rate test
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div
                    className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-line bg-white/96 px-4 py-4 backdrop-blur"
                    data-animate="stage"
                  >
                    <button
                      type="button"
                      onClick={previewResumeState}
                      className="inline-flex items-center gap-2 text-sm font-medium text-mutedInk transition-colors hover:text-ink"
                    >
                      <ClockCounterClockwise className="h-4 w-4" weight="duotone" />
                      Preview merchant leave and nudge
                    </button>
                    <Button size="lg" onClick={testCheckoutRates}>
                      Test checkout rates
                      <ArrowRight className="ml-2 h-4 w-4" weight="bold" />
                    </Button>
                  </div>
                </div>
              ) : null}

              {state.activeStep === "resume" ? (
                <div className="space-y-6">
                  <div className="space-y-4" data-animate="stage">
                    <Badge variant="info" className="w-fit px-3 py-1.5 text-[11px]">
                      Resume
                    </Badge>
                    <div className="max-w-4xl space-y-4">
                      <h2 className="max-w-[15ch] text-[clamp(2.4rem,4.6vw,4.2rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-ink">
                        Bring the merchant back to the exact work that still matters.
                      </h2>
                      <p className="max-w-3xl text-base leading-7 text-mutedInk">
                        Resume should feel specific, not generic. The merchant returns to the exact
                        setup context they left instead of another broad shipping menu or scattered
                        admin surface.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_320px]">
                    <Card className="bg-white" data-animate="stage">
                      <CardHeader>
                        <CardDescription>Persistent admin nudge</CardDescription>
                        <CardTitle className="mt-2 text-2xl tracking-[-0.04em]">
                          Resume from the blocker that still affects checkout trust
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="rounded-[26px] border border-line bg-[#f8faf8] p-5">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
                                <Storefront className="h-5 w-5 text-accent" weight="fill" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-ink">Shopify admin</p>
                                <p className="text-xs uppercase tracking-[0.15em] text-mutedInk">
                                  Saved setup draft
                                </p>
                              </div>
                            </div>
                            <Badge variant="success">Ready to resume</Badge>
                          </div>

                          <div className="mt-5 rounded-2xl border border-line bg-white px-4 py-4">
                            <p className="text-[11px] uppercase tracking-[0.15em] text-mutedInk">
                              Persistent nudge
                            </p>
                            <p className="mt-2 text-[1.4rem] font-semibold tracking-[-0.04em] text-ink">
                              {previewNudgeCount} shipping details left
                            </p>
                            <p className="mt-2 text-sm leading-6 text-mutedInk">
                              Resume from {resumeTargetLabel.toLowerCase()} and keep the merchant in
                              the guided setup flow they already started.
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="rounded-2xl border border-line bg-[#f8faf8] px-4 py-4">
                            <p className="text-[11px] uppercase tracking-[0.15em] text-mutedInk">
                              Last active step
                            </p>
                            <p className="mt-2 text-sm font-medium text-ink">
                              {state.lastLiveStep}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-line bg-[#f8faf8] px-4 py-4">
                            <p className="text-[11px] uppercase tracking-[0.15em] text-mutedInk">
                              Resume target
                            </p>
                            <p className="mt-2 text-sm font-medium text-ink">{resumeTargetLabel}</p>
                          </div>
                          <div className="rounded-2xl border border-line bg-[#f8faf8] px-4 py-4">
                            <p className="text-[11px] uppercase tracking-[0.15em] text-mutedInk">
                              Why this matters
                            </p>
                            <p className="mt-2 text-sm font-medium text-ink">
                              Less configuration paralysis
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-4">
                      <Card className="bg-[#f8faf8]" data-animate="stage">
                        <CardHeader>
                          <CardDescription>Optional admin guidance</CardDescription>
                          <CardTitle className="mt-2 text-xl tracking-[-0.03em]">
                            Let Shopify ask for 3 missing details this week and draft safer
                            shipping settings.
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm leading-6 text-mutedInk">
                          <p>
                            Sidekick-style AI assist is optional help inside Shopify's existing
                            admin guidance layer, not a new standalone agent. It should likely be
                            paywalled because model and API costs can mount.
                          </p>
                          <p>
                            It can draft safer settings or ask for a few missing details over time,
                            but the merchant still owns final approval.
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-white" data-animate="stage">
                        <CardHeader>
                          <CardDescription>Prototype claim</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm leading-6 text-mutedInk">
                          <p>
                            Shipping becomes more visible, guided, and resumable by unifying
                            existing Shopify capabilities into one rescue flow without pretending
                            Shopify knows the business better than the merchant.
                          </p>
                          <div className="inline-flex items-center gap-2 rounded-2xl border border-line px-3 py-2 text-ink">
                            <GlobeHemisphereWest className="h-4 w-4 text-accent" weight="duotone" />
                            Safer defaults, persistent nudges, merchant approval always on
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div
                    className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-line bg-white/96 px-4 py-4 backdrop-blur"
                    data-animate="stage"
                  >
                    <p className="max-w-2xl text-sm leading-6 text-mutedInk">
                      The resume state is the recovery story: keep the merchant accountable, but
                      stop making them start over.
                    </p>
                    <Button size="lg" onClick={resumeSetup}>
                      Resume setup
                      <ArrowRight className="ml-2 h-4 w-4" weight="bold" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
