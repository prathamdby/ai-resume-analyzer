# Repository Guidelines

## Project Structure & Module Organization
The React Router app lives in `app/`, with route modules in `app/routes/*.tsx`, shared UI in `app/components/`, and Puter integrations plus utilities in `app/lib/`. Global prompts and scoring templates sit in `constants/index.ts`, typed surfaces in `types/`, and static assets in `public/`. Keep feature code modular: page-level logic belongs in routes, cross-cutting helpers in `lib`, and persistent state in the `usePuterStore` slices inside `app/lib/puter.ts`.

## Build, Test, and Development Commands
Use Bun for all scripts. Examples:
- `bun install` — sync dependencies (commits should include the updated `bun.lock`).
- `bun run dev` — start the local React Router dev server at port 5173 for manual QA.
- `bun run build` — emit the production bundle into `build/`.
- `bun run start` — serve the built app via `react-router-serve` (used for smoke tests before deploys).
- `bun run typecheck` — generate router types and run `tsc`; every PR must stay green here.

## Coding Style & Naming Conventions
All code is TypeScript with ESLint-style 2-space indentation and Prettier defaults. Favor descriptive camelCase for variables and PascalCase for components and stores. Use Tailwind utility classes consistently; compose conditional styles with `clsx`. Encapsulate Puter.js calls behind helpers in `app/lib/puter.ts` to respect separation of concerns, and keep hooks pure (no side effects outside React lifecycles).

## Testing Guidelines
A formal spec suite is being introduced; until Vitest lands, pair `bun run typecheck` with targeted manual flows in `bun run dev`. New contributions should add Vitest + Testing Library specs under `app/__tests__/feature-name.spec.tsx` (co-locate mocks inside `__mocks__`). Validate store logic and AI prompts with focused unit tests, and capture upload/analyze flows with integration specs once the harness is merged. Treat >80% coverage on new modules as the baseline and document any justified gaps in the PR.

## Commit & Pull Request Guidelines
Match the existing history: concise, sentence-case summaries (e.g., "Add upload flow error handling"), optionally referencing issues like `#123`. Each PR must include a clear problem statement, screenshots or screen recordings for UI changes, notes on testing performed, and callouts for any follow-up work. Request review from another agent before merging and avoid pushing directly to `main`.

## Security & Configuration Tips
Never commit Puter credentials or API tokens; load them from the Puter runtime or `.env.local`, which stays git-ignored. Validate that uploaded resumes are sanitized via `convertPdfToImage` before persisting paths in KV storage. When contributing Docker changes, mirror updates in both `Dockerfile` and docs so deploy pipelines stay repeatable.
