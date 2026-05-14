export type StepId = "diagnose" | "recommend" | "configure" | "resume";

export type PromptId =
  | "fragile-home"
  | "missing-weight"
  | "default-package"
  | "safe-rates";

export type PresetId = "home-decor" | "apparel" | "food" | "furniture";

export type DemoState = {
  activeStep: StepId;
  blockerIndex: number;
  selectedPrompt: PromptId;
  selectedPreset: PresetId;
};

export const storageKey = "shipping-setup-copilot-single-screen-state";

export const stepOrder: StepId[] = ["diagnose", "recommend", "configure", "resume"];

export const promptOrder: PromptId[] = [
  "fragile-home",
  "missing-weight",
  "default-package",
  "safe-rates",
];

export const presetOrder: PresetId[] = ["home-decor", "apparel", "food", "furniture"];

export const defaultState: DemoState = {
  activeStep: "diagnose",
  blockerIndex: 0,
  selectedPrompt: "fragile-home",
  selectedPreset: "home-decor",
};

export const storyRail = [
  {
    label: "Problem",
    text: "Shipping can go live before weight, size, and box details are ready. Then checkout starts guessing.",
  },
  {
    label: "Solution",
    text: "Shopify brings the next missing setup step to the merchant inside admin.",
  },
  {
    label: "Why it works",
    text: "Shopify gives a safer first guess. The merchant still says yes before anything is final.",
  },
] as const;

export const phaseRail = [
  {
    id: "diagnose" as const,
    label: "Diagnose",
    summary: "Find the missing detail.",
  },
  {
    id: "recommend" as const,
    label: "Recommend",
    summary: "Show a safer first guess.",
  },
  {
    id: "configure" as const,
    label: "Configure",
    summary: "Check one setup action.",
  },
  {
    id: "resume" as const,
    label: "Resume",
    summary: "Save the next step in admin.",
  },
] as const;

export const blockerSequence = [
  {
    step: "diagnose" as const,
    eyebrow: "Shopify admin guidance",
    headline: "Shipping rates may be wrong",
    detail: "2 product details are missing.",
    helper: "Shopify brings the next missing step to the merchant.",
    actionLabel: "Fix next detail",
    status: "Start with product weight and size.",
  },
  {
    step: "recommend" as const,
    eyebrow: "Safer first guess",
    headline: "Shopify found a better default package",
    detail: "One starter box can cover the most common order.",
    helper: "This is a starting point, not a final rule.",
    actionLabel: "Use this guess",
    status: "The store keeps full approval.",
  },
  {
    step: "configure" as const,
    eyebrow: "Quick check",
    headline: "One rate check is left",
    detail: "Test one small cart and one bulky cart.",
    helper: "This helps catch a bad broad default before launch.",
    actionLabel: "Check next detail",
    status: "Keep the proof short and clear.",
  },
  {
    step: "resume" as const,
    eyebrow: "Saved in admin",
    headline: "The next step can wait",
    detail: "Shopify saves the next fix and brings it back later.",
    helper: "Helpful guidance stays in admin instead of turning into popups.",
    actionLabel: "Start over",
    status: "Reset returns to the first blocker.",
  },
] as const;

export const promptChips = [
  {
    id: "fragile-home" as const,
    label: "Help me set shipping for fragile home decor",
  },
  {
    id: "missing-weight" as const,
    label: "Find products missing weight",
  },
  {
    id: "default-package" as const,
    label: "Suggest a default package",
  },
  {
    id: "safe-rates" as const,
    label: "Check if my checkout rates look safe",
  },
] as const;

export const storeSignals = [
  "Product descriptions",
  "Category",
  "Store location",
  "Fulfillment location",
  "Past order sizes",
  "Markets served",
] as const;

export const presets = [
  {
    id: "home-decor" as const,
    label: "Home decor",
    summary: "Fragile items.",
    defaults: {
      package: "16 x 12 x 8 padded box",
      handling: "2 day handling",
      rates: "Live rates with a bulky fallback",
      focus: "Check planters and mirrors first",
    },
    note: "Good first guess for breakable items.",
  },
  {
    id: "apparel" as const,
    label: "Apparel",
    summary: "Soft goods.",
    defaults: {
      package: "Mailer bag plus one small box",
      handling: "1 day handling",
      rates: "Flat fallback for low-cost orders",
      focus: "Check tees, hoodies, and bundles",
    },
    note: "Good first guess for fast-moving clothes.",
  },
  {
    id: "food" as const,
    label: "Food / perishables",
    summary: "Cold packs.",
    defaults: {
      package: "Cold pack box with liner",
      handling: "Same day handling",
      rates: "Express-heavy rate mix",
      focus: "Check local and two-day zones",
    },
    note: "Good first guess when freshness matters.",
  },
  {
    id: "furniture" as const,
    label: "Large furniture",
    summary: "Oversized items.",
    defaults: {
      package: "Oversized parcel plus freight review",
      handling: "3 day handling",
      rates: "Manual oversized fallback",
      focus: "Check tables, frames, and sets",
    },
    note: "Good first guess for bulky items.",
  },
] as const;
