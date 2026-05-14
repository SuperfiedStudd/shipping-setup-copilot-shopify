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
    text: "Merchants can go live before weight, package, and rate details are ready. Then checkout rates start guessing.",
  },
  {
    label: "Solution",
    text: "Shopify brings the next missing shipping step into admin and gives the merchant a safer starting point.",
  },
  {
    label: "Why it works",
    text: "The merchant stays in control. Shopify suggests the next best setup step, but the merchant approves before anything changes.",
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
    eyebrow: "Diagnose setup gaps",
    headline: "Checkout rates are still guessing",
    detail: "Weight and package details are missing on 2 best sellers.",
    helper: "Fix the missing shipping details first so checkout can price with more confidence.",
    actionLabel: "Fix next detail",
    status: "Add weight and package size for the top sellers.",
  },
  {
    step: "recommend" as const,
    eyebrow: "Suggested next step",
    headline: "Use a safer default package",
    detail: "One starter box can cover the most common order.",
    helper: "Shopify suggests a stronger starting point from the catalog and the store's order shape.",
    actionLabel: "Use safer default",
    status: "Review the suggested starter package.",
  },
  {
    step: "configure" as const,
    eyebrow: "Fix next detail",
    headline: "Run one fast rate check",
    detail: "Test one small cart and one bulky cart.",
    helper: "A quick rate check catches the broad defaults that usually slip through before launch.",
    actionLabel: "Run rate check",
    status: "Compare one small cart and one bulky cart.",
  },
  {
    step: "resume" as const,
    eyebrow: "Merchant approval",
    headline: "Ready for final review",
    detail: "The suggested shipping setup is ready for merchant approval.",
    helper: "Shopify keeps the next setup step visible, and the merchant decides when to apply it.",
    actionLabel: "Start over",
    status: "Approve the suggested shipping settings.",
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
    note: "Padded packaging and a bulky fallback for fragile shipments.",
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
    note: "Fast handling and flexible packaging for soft goods.",
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
    note: "Cold-pack defaults tuned for freshness and speed.",
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
    note: "Oversized handling with a safer fallback for large deliveries.",
  },
] as const;
