export type StepId = "diagnose" | "recommend" | "configure" | "resume";

export type ConfigureFocusId = "weights" | "package" | "processing" | "carrier";

export type CartId = "planter-pair" | "mirror-bundle";

export type DestinationId = "los-angeles-ca" | "toronto-on";

export type PrototypeState = {
  activeStep: StepId;
  lastLiveStep: Exclude<StepId, "resume">;
  approvedRecommendation: boolean;
  configureFocus: ConfigureFocusId;
  confirmedSettings: ConfigureFocusId[];
  selectedCart: CartId;
  selectedDestination: DestinationId;
  testerOpen: boolean;
  hasTestedRates: boolean;
};

export const storageKey = "shipping-setup-copilot-single-screen-state";

export const defaultState: PrototypeState = {
  activeStep: "diagnose",
  lastLiveStep: "configure",
  approvedRecommendation: false,
  configureFocus: "weights",
  confirmedSettings: ["processing"],
  selectedCart: "planter-pair",
  selectedDestination: "los-angeles-ca",
  testerOpen: false,
  hasTestedRates: false,
};

export const storyRail = [
  {
    label: "Problem",
    text: "Shopify already has shipping settings, profiles, carrier-calculated rates, backup rates, apps, and admin guidance. The real problem is that small merchants may not know which missing detail across weights, dimensions, packages, carriers, fulfillment timing, markets, or rate strategy is blocking accurate checkout rates.",
  },
  {
    label: "Solution",
    text: "This prototype reframes setup as a shipping-specific rescue flow inside Shopify admin. It pulls shipping settings, carrier or app setup, backup rates, packages, markets, and optional Sidekick-style guidance into one visible, guided, resumable surface.",
  },
  {
    label: "Why it works",
    text: "Safer defaults, checkout testing, persistent nudges, and optional admin guidance help the merchant move forward without Shopify replacing merchant judgment. Final approval still stays with the merchant.",
  },
] as const;

export const stepRail = [
  {
    id: "diagnose" as const,
    label: "Diagnose",
    summary: "Surface the missing details that block accurate checkout rates.",
  },
  {
    id: "recommend" as const,
    label: "Recommend",
    summary: "Recommend safer starting defaults from existing Shopify signals.",
  },
  {
    id: "configure" as const,
    label: "Configure",
    summary: "Guide the merchant through existing shipping surfaces one decision at a time.",
  },
  {
    id: "resume" as const,
    label: "Resume",
    summary: "Keep resurfacing the exact setup work until final settings are approved.",
  },
] as const;

export const diagnoseBlockers = [
  {
    id: "weights",
    title: "Missing product weights and dimensions",
    detail: "Mixed-size carts cannot quote cleanly when mirrors, bundles, and fragile decor still use blanks or draft values.",
  },
  {
    id: "package",
    title: "Missing default package",
    detail: "Carrier estimates stay brittle until Shopify has a realistic baseline box for the most common parcel shape.",
  },
  {
    id: "strategy",
    title: "No confirmed carrier or rate strategy",
    detail: "The merchant still needs a first-pass decision across carrier-calculated rates, fallback coverage, and which Shopify shipping path should anchor checkout.",
  },
] as const;

export const merchantArchetype = {
  name: "Small home decor store",
  detail:
    "Mixed-size products, one US fulfillment location, and a product mix that swings from lightweight planters to bulky mirrors.",
};

export const recommendationHighlights = [
  {
    label: "Local carriers first",
    value: "USPS, UPS, FedEx",
    note: "Suggested from a US origin and mostly domestic demand, with Shopify surfacing the most relevant existing carrier paths first.",
  },
  {
    label: "Suggested processing days",
    value: "2 to 3 business days",
    note: "Matches current fulfillment pace so delivery promises stay believable.",
  },
  {
    label: "Suggested default package",
    value: '16 x 12 x 8 in corrugated box',
    note: "A safe first parcel for tabletop and planter orders before the merchant fine-tunes oversized products.",
  },
  {
    label: "Rate strategy",
    value: "Live carrier rates with a domestic fallback threshold at $150",
    note: "Smart defaults from store signals only. Shopify is organizing existing shipping capabilities into a safer starting point, not making automatic changes.",
  },
] as const;

export const recommendationAlternatives = [
  {
    title: "One flat rate everywhere",
    detail: "Too risky for mixed-size decor because mirrors and bundles swing far outside the average parcel cost.",
  },
  {
    title: "Free shipping on every order",
    detail: "Too expensive before the merchant has a clean picture of oversized and cross-border shipping cost.",
  },
] as const;

export const configureSettings = [
  {
    id: "weights" as const,
    title: "Product weight and dimension draft",
    helper: "Start with broad draft bands so the merchant can cover the catalog fast, then review the bulky outliers later inside the normal product workflow.",
    previewValue: "146 items grouped into lightweight, standard, and oversized bands",
    whyItMatters: "Shipping quotes feel broken when the product facts are missing. This is the fastest place to reduce bad defaults.",
    lines: [
      "Tabletop decor: 1.5 lb average, 10 x 8 x 6 in",
      "Large mirrors: 18 lb average, manual review flag stays on",
      "Bundles: dimension estimate stays editable before launch",
    ],
    confirmLabel: "Mark product sizing ready",
  },
  {
    id: "package" as const,
    title: "Default package",
    helper: "Give checkout a believable first parcel before the merchant has every packaging variant mapped in existing shipping settings.",
    previewValue: '16 x 12 x 8 in, 2.4 lb tare weight',
    whyItMatters: "A default package reduces undercharging and stops live rates from failing on otherwise healthy orders.",
    lines: [
      "Corrugated box for ceramics and planters",
      "Protective fill assumed for fragile home decor",
      "Oversized products stay outside this default and keep a manual flag",
    ],
    confirmLabel: "Mark package ready",
  },
  {
    id: "processing" as const,
    title: "Processing days",
    helper: "The merchant still approves the promise, but Shopify can suggest a believable default from current fulfillment behavior already visible in admin.",
    previewValue: "2 business days standard, 4 days for custom bundles",
    whyItMatters: "Rate accuracy means less if delivery timing feels optimistic or disconnected from the real operation.",
    lines: [
      "Standard decor ships in 2 business days",
      "Custom bundle handling stretches to 4 business days",
      "Weekend promises stay off by default",
    ],
    confirmLabel: "Keep processing default",
  },
  {
    id: "carrier" as const,
    title: "Carrier account or provider",
    helper: "The merchant sees a focused local shortlist first instead of bouncing between scattered carrier and app setup decisions.",
    previewValue: "UPS primary, USPS lightweight backup, FedEx optional",
    whyItMatters: "Relevant local carriers help the merchant move faster while keeping the final provider choice and approval in the merchant's hands.",
    lines: [
      "UPS suggested for mixed-size domestic coverage",
      "USPS highlighted for sub-2 lb cartons",
      "FedEx available, but not promoted unless the merchant wants it",
    ],
    confirmLabel: "Mark carrier plan ready",
  },
] as const;

export const sampleCarts = [
  {
    id: "planter-pair" as const,
    label: "Planter pair",
    contents: "2 ceramic planters and 1 tray",
    value: "$86",
    weight: "6.1 lb",
  },
  {
    id: "mirror-bundle" as const,
    label: "Mirror bundle",
    contents: "1 wall mirror and 2 candle holders",
    value: "$214",
    weight: "19.4 lb",
  },
] as const;

export const destinations = [
  {
    id: "los-angeles-ca" as const,
    label: "Los Angeles, CA",
    note: "Domestic checkout",
  },
  {
    id: "toronto-on" as const,
    label: "Toronto, ON",
    note: "Cross-border checkout",
  },
] as const;

export const focusOrder: ConfigureFocusId[] = ["weights", "package", "processing", "carrier"];
