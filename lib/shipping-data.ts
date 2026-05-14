export type StepId = "diagnose" | "recommend" | "configure" | "resume";

export type PromptId =
  | "review-package-details"
  | "check-default-rate";

export type PresetId =
  | "small-soft-goods"
  | "fragile-home-decor"
  | "heavy-furniture";

export type DemoState = {
  activeStep: StepId;
  blockerIndex: number;
  selectedPrompt: PromptId;
  selectedPreset: PresetId;
};

export const storageKey = "shipping-setup-copilot-single-screen-state";

export const stepOrder: StepId[] = ["diagnose", "recommend", "configure", "resume"];

export const promptOrder: PromptId[] = [
  "review-package-details",
  "check-default-rate",
];

export const presetOrder: PresetId[] = [
  "small-soft-goods",
  "fragile-home-decor",
  "heavy-furniture",
];

export const defaultState: DemoState = {
  activeStep: "diagnose",
  blockerIndex: 0,
  selectedPrompt: "review-package-details",
  selectedPreset: "fragile-home-decor",
};

export const storyRail = [
  {
    label: "Problem",
    text: "Merchants can go live before weight, package, and rate details are ready. Then checkout rates start guessing.",
  },
  {
    label: "Solution",
    text: "Shopify keeps incomplete shipping setup visible inside admin and narrows the next shipping decision.",
  },
  {
    label: "Why it works",
    text: "Shopify recommends safer defaults, keeps testing focused, and waits for merchant approval before anything changes.",
  },
] as const;

export const phaseRail = [
  {
    id: "diagnose" as const,
    label: "Diagnose",
    summary: "Add missing setup details.",
  },
  {
    id: "recommend" as const,
    label: "Recommend",
    summary: "Choose a safer default.",
  },
  {
    id: "configure" as const,
    label: "Configure",
    summary: "Test checkout scenarios.",
  },
  {
    id: "resume" as const,
    label: "Resume",
    summary: "Approve final settings.",
  },
] as const;

export const blockerSequence = [
  {
    step: "diagnose" as const,
    eyebrow: "Diagnose setup gaps",
    headline: "Incomplete shipping details are still live",
    detail: "2 best sellers still need product weight, package size, and fulfillment timing.",
    helper: "Shopify keeps the missing setup work visible in admin so the merchant can fill in the next shipping detail fast.",
    actionLabel: "Fix next detail",
    status: "Add weight, package size, and fulfillment time.",
  },
  {
    step: "recommend" as const,
    eyebrow: "Suggested next step",
    headline: "Choose a safer default package",
    detail: "Shopify can suggest a starting package, handling plan, and rate fallback from store signals.",
    helper: "Use product descriptions, category, store location, fulfillment location, past order sizes, and markets served to narrow the choice.",
    actionLabel: "Use safer default",
    status: "Pick the default that best matches the catalog.",
  },
  {
    step: "configure" as const,
    eyebrow: "Fix next detail",
    headline: "Test the rates before launch",
    detail: "Run one small-cart check and one bulky-cart check before the merchant approves the setup.",
    helper: "A simpler test view keeps the next rate decision focused and catches defaults that would overcharge or undercharge at checkout.",
    actionLabel: "Run rate check",
    status: "Compare a small cart and a bulky cart.",
  },
  {
    step: "resume" as const,
    eyebrow: "Merchant approval",
    headline: "Ready for merchant approval",
    detail: "The safer default and final rate checks are ready for review inside admin.",
    helper: "Shopify keeps unfinished shipping setup visible until the merchant confirms the last change.",
    actionLabel: "Start over",
    status: "Approve the final shipping settings.",
  },
] as const;

export const promptChips = [
  {
    id: "review-package-details" as const,
    label: "Review missing package details",
  },
  {
    id: "check-default-rate" as const,
    label: "Check default rate before launch",
  },
] as const;

export const diagnoseFields = [
  {
    label: "Product weight",
    value: "0.8 lb",
  },
  {
    label: "Package size",
    value: "12 x 10 x 4 in",
  },
  {
    label: "Fulfillment time",
    value: "1-2 business days",
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
    id: "small-soft-goods" as const,
    label: "Small soft goods",
    summary: "Poly mailer, standard handling, backup flat rate.",
    defaults: {
      package: "Poly mailer",
      handling: "Standard handling",
      rates: "Backup flat rate",
      focus: "Check tees, socks, and one-item orders",
    },
    note: "A lighter default for low-risk orders that still need a fallback rate.",
  },
  {
    id: "fragile-home-decor" as const,
    label: "Fragile home decor",
    summary: "Padded box, 2 day handling, bulky fallback.",
    defaults: {
      package: "Padded box",
      handling: "2 day handling",
      rates: "Bulky fallback",
      focus: "Check mirrors, planters, and mixed carts",
    },
    note: "A safer starting point for breakable items with more shipping risk.",
  },
  {
    id: "heavy-furniture" as const,
    label: "Heavy furniture",
    summary: "Oversized package, freight review, manual approval.",
    defaults: {
      package: "Oversized package",
      handling: "Freight review",
      rates: "Manual approval",
      focus: "Check tables, frames, and oversized deliveries",
    },
    note: "A controlled default for large items that need a final merchant check.",
  },
] as const;
