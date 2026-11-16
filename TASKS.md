# Build Progress Tracker

> Live checklist used during development so no requirement or bug fix gets missed.

## 1. Scaffold
- [x] Vite + React project files (package.json, vite.config, index.html)
- [x] Folder structure: `src/data`, `src/context`, `src/components`, `src/hooks`, `src/utils`

## 2. Mock Data
- [x] Layout definitions: 3-2 and 2-3-2 (letters + aisle positions)
- [x] Seat generator: row/letter, category (Standard ₹0 / Premium ₹250 / Extra Legroom ₹350)
- [x] Deterministic occupied-seat seeding (~30%)
- [x] Meal options (free + paid)

## 3. State Management (Context + useReducer)
- [x] State: passengers, selectedPassengerId, assignments, meals, layout
- [x] Actions: SET_PASSENGER_COUNT, SELECT_PASSENGER, ASSIGN_SEAT, REMOVE_SEAT, SWITCH_LAYOUT, SELECT_MEAL
- [x] Derived occupancy (pre-occupied + assigned) - single source of truth
- [x] Edge: passenger count decrease removes orphan assignments
- [x] Edge: layout switch clears now-invalid assignments + notifies user

## 4. Seat Map UI
- [x] Seat component with 4 states: available / occupied / selected / taken-by-other
- [x] Price badge on paid seats, tooltip with details
- [x] Row numbers + aisle gaps + seat labels
- [x] Legend (states + pricing categories)
- [x] Layout switcher (3-2 ⇄ 2-3-2)
- [x] Click available seat → assigns to selected passenger
- [x] Click occupied/taken seat → toast feedback, no state change

## 5. Passenger Panel
- [x] Count selector (1-7)
- [x] Passenger cards: name, assigned seat, seat price, remove-seat button
- [x] Active passenger highlight; switching retains assignments

## 6. Meals (bonus)
- [x] One meal per passenger, free + paid options
- [x] Meal shown per passenger, included in total

## 7. Price Summary
- [x] Per-passenger breakdown (seat + meal)
- [x] Grand total updates immediately
- [x] "Confirm" action with validation state (disabled until all seated)

## 8. UX / States
- [x] Loading state (initial simulated fetch, skeleton)
- [x] Empty state (no passenger selected hint)
- [x] Toast feedback system for invalid actions
- [x] Responsive: stacked layout <900px, scrollable seat map

## 9. Quality
- [x] `npm run build` passes with no errors
- [x] Smoke test: 27/27 checks pass (render + reducer logic incl. double-assign, moves, meals, occupied rejection, count drop, layout switch, toggle)
- [x] README: state management + seat-assignment logic explanation
- [x] Deployed: GitHub Pages (gh-pages branch) - LIVE, HTTP 200, verified

## Deployment notes
- GitHub account had a billing lock → Actions runners refused to start (workflow build job failed).
- Worked around it with the classic branch deploy: Pages source = `gh-pages` branch, deployed via `npm run deploy` (gh-pages package). Verified live at
  https://swapnil26-art.github.io/flight-seat-selection-passenger-management/
- Once the billing issue is fixed at https://github.com/settings/billing, the user may switch back to Actions if preferred (README documents both).

## Bugs found & fixed during build
1. `SeatRow.jsx` imported `Seat` as named export but it was a default export → build failed → fixed import.
2. Stray garbage line in CSS custom properties (`--ink-soft: #5b6activity877`) → removed (second declaration had masked it).
3. Reducer `ASSIGN_SEAT` early-returned when *anyone* held the seat, which made the "click own seat to remove" toggle unreachable → guard now only blocks when a *different* passenger holds it.
4. Loading state initially lived in the reducer, blocking SSR smoke test and mixing view concern into data state → moved `loading` to `App` via `useState`.
5. Smoke test initially tried to load `react-dom/server` through Vite → import natively instead; interaction probe replaced with pure reducer unit checks.

## Pass 2 - full code review (all fixed)
6. **Ghost price pill on free seats**: JSX renders `data-price=""` (empty string still creates the attribute), so the `[data-price]::after` CSS painted a tiny empty badge above every free seat → now `undefined` so the attribute is omitted entirely.
7. **Invalid nested interactive elements**: `PassengerCard` had a `role="button"` span inside a real `<button>` → restructured to a div card (role=button, keyboard support) containing a real ✕ button; CSS updated for cursor/focus/reset styles.
8. **No feedback on seat move**: moving a passenger to a different seat was silent → added info toast ("A moved from seat 1C to 3D").
9. **Reducer accepted occupied seats on direct dispatch** (UI guarded it, but defense-in-depth was missing) → reducer now verifies the seat exists and isn't pre-occupied before assigning.
10. **Blank white page on Vercel**: `vite.config.js` had `base: '/flight-seat-selection-passenger-management/'` (GitHub Pages sub-path), so on Vercel the browser requested assets under a path that doesn't exist there -> 404 -> blank page. Fixed by switching to a relative base (`./`), which works on both hosts with one build.
11. Also noted: the user's Vercel link served Vercel's login page, i.e. Deployment Protection was enabled - needs disabling in the Vercel dashboard (Settings -> Deployment Protection).

## Pass 2 - test additions (27/27 passing)
- Occupied-seat rejection at reducer level
- Seat move frees the old seat automatically
- Seat+meal total arithmetic consistency (₹850 scenario)
- Meal selection recorded per passenger
- Tests now pick free seats dynamically instead of hardcoding IDs
