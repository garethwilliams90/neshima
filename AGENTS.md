<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Neshima

Neshima is a guided breathing web application. A person picks a breathing program, follows a timed visual guide, and finishes a session. Completing a session awards experience points, advances a classic level, and counts toward a daily streak. A profile shows that person's progress and activity.

This file is the product and engineering source of truth for agents working in this repo. Implement what it describes. When a task and this file disagree, follow this file and ask the user before doing anything else.

## Agent constraints

These constraints are binding. They apply to every task, including small fixes, refactors, and "while I'm here" improvements.

- Stay on the stack below. Do not add, swap, or parallel a layer (UI kit, styling system, data/state library, API style, or host) unless the user explicitly approves that change in the current conversation.
- Build only the product described here: box breathing, 4-7-8 breathing, experience and levelling, streaks, and a personal progress profile. Do not add programs, social features, leaderboards, payments, notifications, accounts beyond what identity requires, audio, native apps, or an AI coach unless the user asks for that feature.
- Do not change technique definitions, the experience formula, the level curve, or the streak rules. Those are specified below so sessions, points, and streaks stay consistent.
- Do not award experience or streak credit for an abandoned session.
- Do not make medical, therapeutic, or diagnostic claims. Neshima is a wellness practice tool. Copy can describe the usual way to breathe (for example, in through the nose and out through the mouth). It must not promise health outcomes.
- Identity, the database, and the GraphQL server are chosen below. Do not swap Supabase, GraphQL Yoga, or Pothos for another vendor or library. Do not use `localStorage` as the long-term store for profile, points, or streaks.
- Prefer the current Next.js APIs in `node_modules/next/dist/docs/` over training-data habits. The project uses the App Router.
- If the user approves a deviation, update this file in the same change so the spec and the product stay aligned.
- Ask before expanding scope. A task to build one feature is not permission to scaffold the others, redesign the visual language, or introduce new dependencies "for later."

## Stack

Use these tools for their stated jobs. Versions already in the repo win over newer majors unless the user asks to upgrade.

| Layer | Choice | Job |
| --- | --- | --- |
| Application | Next.js (App Router, TypeScript) | Routes, layouts, server and client components. Read `node_modules/next/dist/docs/` before writing framework code. |
| Styling | Tailwind CSS | Layout, spacing, color, typography, and responsive behavior. |
| Components | shadcn/ui | Buttons, forms, cards, dialogs, progress, and other chrome. Add components with the shadcn CLI for this Next.js and Tailwind setup. |
| Domain state | Apollo Client and GraphQL | The app's source of truth for the user, preferences, completed sessions, experience, and streaks. The Apollo cache is the client cache for that data. Use `@apollo/client-integration-nextjs` so the App Router can render with that cache. |
| GraphQL server | GraphQL Yoga and Pothos | One GraphQL endpoint in a Next.js route handler. Yoga serves it. Pothos defines the schema in TypeScript. |
| Database | Supabase Postgres | Stored users, settings, completed sessions, experience, and streaks. Schema changes are SQL migrations in the repo. |
| Authentication | Supabase Auth | Sign in with Google or GitHub. Sessions are cookies via `@supabase/ssr`. |
| Hosting | Vercel | The app is a Vercel deployment. Keep persistence and APIs compatible with that runtime. |
| Animation | Motion (`motion`, the current Framer Motion package) | Breathing-guide motion only: the traveling indicator and the active side of the square. Approved for this project. Motion does not keep time. Phase changes follow a monotonic clock (`performance.now` or an animation-frame timestamp). The phase name stays readable and does not animate out. |

Do not introduce Material UI, Chakra, Radix-as-a-separate-kit, another CSS framework, CSS modules as the primary styling approach, styled-components, Redux, Zustand, Jotai, MobX, TanStack Query, SWR, Auth.js, Clerk, Better Auth, Drizzle, Prisma, or a REST API for domain data. Supabase's Data API (PostgREST) is not the app's API. The browser talks to GraphQL for progress, and to Supabase Auth only to start, finish, and read a session.

shadcn/ui is for application chrome. The breathing guide itself is a custom visual built with Tailwind and SVG or CSS. Do not force that guide into a stock widget, and do not build a second general-purpose component library beside shadcn.

### What belongs in GraphQL

Persisted domain state goes through the GraphQL schema and Apollo Client: the user, saved program settings, completed sessions, total experience, and streak fields.

The live countdown does not. While a session is running, the current phase, the deadline for that phase, and the animation progress live in component state. Write them to the server once, when a signed-in user finishes the session, through a completion mutation. Do not mutate GraphQL on every tick. Signing in and signing out are Supabase Auth, not GraphQL mutations.

Derive displayed level progress from total experience. Total experience is the stored value. Level, experience into the current level, and experience required for the next level are calculations, not separately editable counters.

## Identity and persistence

Supabase is the database and the sign-in provider. Google and GitHub are the only ways to sign in. The GraphQL API stays in this Next.js app, in front of Postgres, so experience and streak rules run in one place and the browser never writes those numbers itself.

Auth.js, Clerk, and a separate Postgres host were set aside. They are common with Next.js, and they would split the signed-in user from the rows that belong to that user. Supabase Auth and Supabase Postgres share one user id.

### Sign-in

- Providers are Google and GitHub only. Do not add email and password, magic links, or other social providers.
- The browser client from `@supabase/ssr` is for auth only: start the OAuth redirect, sign out, and read whether someone is signed in. It does not query or mutate profile, sessions, experience, or streaks.
- OAuth returns to `app/auth/callback/route.ts`, which exchanges the code for a session cookie.
- `proxy.ts` (Next.js 16's proxy, not `middleware.ts`) refreshes that cookie. Follow the current `@supabase/ssr` cookie guidance: `getAll` and `setAll` only. Do not use `@supabase/auth-helpers-nextjs`.
- There is no password screen. Google and GitHub buttons live in the app chrome, including the program sidebar and the signed-out profile. Hide them while a session is running, with the rest of the navigation.
- Public environment variables are `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The secret key stays on the server and is not used for normal requests. The user's session is what authorizes those requests.

### What a new account gets

The first successful sign-in creates one profile row for that Supabase auth user.

- Display name comes from the provider (a name, otherwise the GitHub login or the email local-part). The profile shows that name. Do not add a name editor unless the user asks.
- Timezone starts empty. The first signed-in page view in the browser records `Intl.DateTimeFormat().resolvedOptions().timeZone` when the profile timezone is empty. Later visits do not overwrite it.
- Experience starts at 0, streaks start empty, and program settings start at the global defaults in this file.

### Database

Postgres tables, owned by the Supabase project, changed only through SQL migrations in `supabase/migrations`. Do not treat a dashboard edit as the schema.

- `profiles` — one row per auth user. Id equals the auth user id. Display name, IANA timezone, lifetime experience, current streak, longest streak, last practice date, box breathe length, box cycles, and 4-7-8 cycles.
- `completed_sessions` — one row per finished session. User id, program (`box` or `four_seven_eight`), completion time, cycle count, box breathe length when the program is box, duration in seconds, and experience awarded.

Do not store a level column. Compute level from lifetime experience.

A completed session is one database transaction, implemented as a Postgres function the GraphQL mutation calls. That function inserts the session, adds the experience, updates the streak, and updates saved settings, then returns the session and the profile. It checks that the caller is the signed-in user, and it rejects durations that do not match the formulas in this file. A failed or abandoned session never calls it.

Row Level Security is on. A signed-in user can read their own profile and their own completed sessions. They cannot insert or edit experience, streaks, or session rows directly. The completion function is the only writer of those fields. Someone calling Supabase's Data API with the publishable key must not be able to award themselves points.

### GraphQL server

- Endpoint: `app/api/graphql/route.ts`, served by GraphQL Yoga.
- Schema and resolvers: Pothos, in TypeScript, next to that route.
- Context is the signed-in user from the request cookies, or an anonymous viewer. Resolvers use a server Supabase client bound to that user's session, so the database still sees the user.
- Apollo Client uses a same-origin HTTP link to `/api/graphql` and sends cookies. Server-rendered client components go through `@apollo/client-integration-nextjs`.
- Operations the product needs: the current user and their saved settings, their completed sessions newest first, and the completion mutation. Add a timezone mutation only for the first-write described above.
- GraphiQL may be on in development. It is off in production.

### Signed-out practice

Box breathing and 4-7-8 work without an account. The setup draft still lives in the breathing layout for that visit. Finishing a session still shows that sitting's duration and experience. It does not call the completion mutation, does not change a streak, and does not update saved defaults. Signing in afterward does not backfill that sitting.

`/profile` is the signed-in progress page. Signed out, that route offers Google and GitHub sign-in and does not show another person's data. Breathing routes stay public.

## Shared session flow

Both programs use the same flow.

1. The user chooses box breathing or 4-7-8.
2. They set the controls that program allows, then start. Settings apply to the session about to start. They cannot be changed mid-session.
3. The guide shows the current phase in large text, a countdown of the seconds left in that phase, and the program's visual. The screen stays quiet: no unrelated navigation, marketing, or settings during the exercise.
4. The user can end the session early. Ending early saves nothing. It awards no experience and does not change the streak.
5. When every planned cycle finishes, show a completion summary: program, cycles, duration, and experience gained. When the user is signed in, also show level (and whether it increased) and what happened to the streak. When they are signed out, stop at this sitting. Do not invent a level or a streak.
6. When the user is signed in, persist that result with the completion mutation. The profile, totals, and activity list update from the Apollo cache. When they are signed out, persist nothing.

Timing must be based on timestamps (`performance.now` or an equivalent monotonic clock), not on counting `setInterval` callbacks. If the tab stutters, the phase still ends at the correct wall-clock moment. Phase length is never shortened to catch up, and missed callbacks never skip a phase early.

Respect `prefers-reduced-motion`: keep the phase name and countdown, and reduce or remove movement on the guide. Phase changes must be available to assistive technology, not only drawn on the visual.

## 1. Box breathing

Box breathing is four equal phases, in this order, repeated for a chosen number of cycles:

1. Inhale
2. Hold
3. Exhale
4. Hold

Equal length is the technique. All four phases share one breathe length. Do not offer separate durations per side, and do not drop either hold.

**Controls**

- Breathe length: integer seconds for every phase. Default 4. Allowed range 2–10.
- Cycles: how many times the four phases repeat. Default 4. Allowed range 1–20.
- Show the resulting session time before start: `cycles × breathe length × 4` seconds. Changing either control updates that time immediately.

**Visual**

A square is the guide. An indicator travels the perimeter once per cycle: one side for each phase, in the order above. The active side is visually distinct. The phase name and the remaining seconds in that phase are readable without watching the indicator. Do not replace the square with a circle for this program. The 4-7-8 guide must look different, so the two programs are not confused.

**Example**

Breathe length 4 and 4 cycles is a 64-second session (16 seconds per cycle). That completed session awards 64 experience points.

## 2. Experience and levelling

Completing a breathing exercise awards experience. Abandoning a session awards none. There is no daily cap, no streak multiplier, and no bonus for a particular program. Experience measures the guided breathing the user actually finished.

**Award**

Experience gained equals the completed session's guided duration in seconds.

- Box: `cycles × breathe length in seconds × 4`
- 4-7-8: `cycles × 19`

Round nothing. Every term is an integer, so the result is an integer. Add it to the user's lifetime total.

**Level curve**

The user starts at level 1 with 0 experience.

Experience required to advance from level `L` to level `L + 1` is `100 × L`.

Cumulative experience required to *be* level `L` is `50 × (L − 1) × L`.

| Total XP | Level | XP into this level | XP required for this level |
| --- | --- | --- | --- |
| 0 | 1 | 0 | 100 |
| 99 | 1 | 99 | 100 |
| 100 | 2 | 0 | 200 |
| 299 | 2 | 199 | 200 |
| 300 | 3 | 0 | 300 |
| 600 | 4 | 0 | 400 |

Given lifetime experience `xp`, level is the largest integer `L >= 1` such that `50 × (L − 1) × L <= xp`. Experience into the current level is `xp − 50 × (L − 1) × L`. Experience required to finish the level is `100 × L`.

Show this as a level number and a progress indicator from the experience already earned inside the level toward `100 × L`. Crossing a threshold on the completion screen is worth stating ("Level 2"). Do not add extra rewards, badges, or unlocks for levelling unless the user asks.

## 3. Streaks

A streak encourages practicing on consecutive days. It is independent of how much experience a session awarded and of how many sessions happened in one day.

A practice day is the user's local calendar date of a *completed* session. Store an IANA timezone on the user and evaluate dates in that timezone. Do not use the server's UTC date as the streak boundary.

After each completed session:

- If the user has never completed a session, the current streak becomes 1 and today is the last practice date.
- If the last practice date is today, the current streak stays as it is.
- If the last practice date is yesterday, the current streak increases by 1 and the last practice date becomes today.
- If the last practice date is earlier than yesterday, the current streak becomes 1 and the last practice date becomes today.

The longest streak becomes whichever is greater of its previous value and the current streak after that update. It does not decrease when the current streak resets.

Incomplete sessions do not create or extend a practice day, and they do not break a streak. A missed day is applied the next time the user completes a session, not by a background job.

Show the current streak where the user decides to practice, and show both the current streak and the longest streak on the profile. Copy should treat the streak as a gentle prompt to return tomorrow, not as a punishment.

## 4. Profile

The profile is that user's record. It is not a generic dashboard and it does not show other people.

It includes:

- Display name
- Level, experience into the current level, experience required for the next level, and lifetime experience
- Current streak, longest streak, and last practice date
- Totals: completed sessions, guided seconds (displayed as a readable duration), and experience
- A split of those totals between box breathing and 4-7-8
- An activity list of completed sessions, newest first. Each entry shows the program, the settings used (box breathe length and cycles, or 4-7-8 cycles), duration, experience awarded, and when it was completed
- The user's saved defaults for the controls each program allows, so the next session starts from their practice rather than the global default

Saved defaults update when the user completes a session with those settings. Starting a session and abandoning it does not change saved defaults.

Empty states are part of the profile: level 1, 0 experience, no streak, and no activity, with a way to start the first session.

## 5. 4-7-8 breathing

4-7-8 is three phases, in this order, with fixed lengths:

1. Inhale for 4 seconds
2. Hold for 7 seconds
3. Exhale for 8 seconds

One cycle is 19 seconds. There is no second hold. The 4, 7, and 8 are the technique. Do not make them editable, and do not add a configuration UI that implies they can change.

**Controls**

- Cycles only. Default 4. Allowed range 1–8.
- Show the resulting session time before start: `cycles × 19` seconds.

**Visual**

Use a three-phase guide, not a four-sided box. A single breath marker (expanding while inhaling, still while holding, contracting while exhaling) is appropriate, together with the phase name and the countdown. Instructional copy can say to inhale through the nose and exhale through the mouth.

**Example**

4 cycles is a 76-second session and awards 76 experience points.

## Domain contract

Implement the behavior above with this shape. Field names can match the schema style of the codebase, but the concepts and rules stay.

- A user has an id, display name, IANA timezone, lifetime experience, current streak, longest streak, last practice date, and saved settings for each program.
- Box settings are breathe length in seconds and cycle count.
- 4-7-8 settings are cycle count only.
- A completed breathing session records the program, completion time, cycle count, box breathe length when relevant, duration in seconds, and experience awarded.
- The completion mutation calls the Postgres function that creates that session, adds the experience, updates the streak fields, updates saved settings, and returns the session plus the updated user. It is only available to the signed-in user, and only for a session whose duration matches the formula for that program.
- Profile and activity queries read the signed-in user and their completed sessions. An anonymous viewer has no profile and no activity.

Do not store a level column as an independently updated value. Compute it from lifetime experience.

## Information architecture

- Home opens box breathing. Choose the other program from the sidebar.
- A collapsible program sidebar lists box breathing and 4-7-8. It lives in the breathing layout, so whether it is open, the box settings, and the 4-7-8 cycle count stay as you move between `/breathe/box` and `/breathe/4-7-8`.
- Hide that sidebar while a session is running. The exercise screen stays free of navigation.
- Box session: `/breathe/box`. The box controls (before start) and the box guide.
- 4-7-8 session: `/breathe/4-7-8`. The cycle control (before start) and the 4-7-8 guide.
- Profile: `/profile`, for the signed-in user's progress and activity. Signed out, this route offers Google and GitHub sign-in.
- Sign-in controls sit in the app chrome, including the program sidebar. They are absent while a session is running.

Route names may follow Next.js file conventions. Do not add sections for community, shop, library of extra techniques, or settings that change the rules in this file.

## Visual tone

The product should feel calm and spare. During a session, the phase and the countdown dominate. Use shadcn components and Tailwind for the surrounding interface. Support light and dark mode with the theme approach already used by the app and by shadcn. Keep contrast high on the phase label. Motion is there to show where the user is in the breath, not as decoration.

## Out of scope

Unless the user explicitly asks, do not build:

- Further breathing techniques, custom phase editors, or unequal box sides
- Pause and resume inside a session
- Sound, haptics, or voice guidance
- Reminders, email, or push notifications
- Social features, sharing, friends, or leaderboards
- Badges, currencies other than experience, or rewards beyond level progress
- Email and password, magic links, extra OAuth providers, account deletion UI, or a display-name editor
- A second database client, ORM, or auth library beside Supabase and the GraphQL server
- Payments, subscriptions, or a marketing site
- Native or desktop wrappers
- Offline sync
- Medical content, symptom tracking, or outcome claims
