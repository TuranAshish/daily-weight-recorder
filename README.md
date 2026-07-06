# Daily Weight Recorder

A modern, responsive, ad-free weight recorder app built with Next.js, TypeScript, Tailwind CSS, shadcn-style UI components, Recharts, and localStorage.

## Features

- Add daily weight entries in kilograms
- Edit and delete previous records
- Latest weight, total change, highest, lowest, and average stats
- Recharts progress chart
- Search and date filters
- Dark/light mode
- Browser-only storage with localStorage
- Fully responsive dashboard UI
- Ready for Vercel deployment

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui style local components
- Recharts
- lucide-react icons
- localStorage

## Run Locally

```bash
pnpm install
pnpm dev
```

Then open:

```bash
http://localhost:3000
```

## Build

```bash
pnpm build
pnpm start
```

## Deploy on Vercel

1. Push this project to GitHub.
2. Import the repository in Vercel.
3. Keep the default Next.js settings.
4. Deploy.

No environment variables or backend setup are required.


## pnpm 11 note

If pnpm shows `ERR_PNPM_IGNORED_BUILDS` for `unrs-resolver`, this project already allows that dependency under `pnpm.onlyBuiltDependencies`. Run:

```bash
pnpm install
pnpm dev
```

If your local pnpm still asks, run `pnpm approve-builds`, select `unrs-resolver`, press Enter, then run `pnpm dev` again.


## Notes

This project uses `next.config.mjs` because Next.js 14 does not support `next.config.ts` for this setup.

## Favicon files

This project includes favicon assets in the `public/` folder:

- `favicon.ico`
- `favicon.svg`
- `favicon-32x32.png`
- `apple-touch-icon.png`
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`
- `site.webmanifest`

The `app/layout.tsx` metadata is already configured to use these icons.

