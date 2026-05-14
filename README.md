# Shipping Setup Copilot

Shipping Setup Copilot is a clickable Shopify APM take-home prototype that reframes shipping setup as a blocker-first, resumable workflow.

## What the prototype does

- Surfaces the shipping blockers that make rates unreliable before a merchant picks a shipping strategy
- Recommends a setup path from store signals, then requires merchant approval
- Guides the merchant through the blockers that matter most for rate accuracy
- Lets the merchant test sample carts and destinations to see why rates appear or fail
- Saves progress locally and resumes on the exact step where setup was interrupted

## Product hypothesis

Merchants abandon shipping setup because the important dependencies stay hidden until late in the process. If Shopify leads with the blockers, suggests a setup path from store signals, and proves the result with rate testing plus resume state, more merchants should finish setup and trust their checkout rates.

## Local development

Requirements:

- Node.js 20 or newer
- npm 10 or newer

Install and run:

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

Quality checks:

```bash
npm run typecheck
npm run build
```

Optional Windows fallback:

If a local Windows environment cannot load Next's native SWC binary, you can point Next at the installed WASM package before running the build:

```powershell
$env:NEXT_TEST_WASM_DIR="$PWD\\node_modules\\@next\\swc-wasm-nodejs"
npm run build
```

## Deploy to Vercel

Preview deployment:

```bash
npx vercel
```

Production deployment:

```bash
npx vercel --prod
```

Recommended flow:

1. Run `npm install`
2. Run `npm run build`
3. Run `npx vercel`
4. Review the preview URL
5. Run `npx vercel --prod` when the preview looks correct

Vercel should auto-detect this as a standard Next.js App Router project, so no extra platform configuration is required.
