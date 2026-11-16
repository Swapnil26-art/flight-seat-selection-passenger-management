# ✈️ SkySelect - Flight Seat Selection & Passenger Management

An interactive flight seat-selection interface built with **React 18 + Vite**. Passengers pick how many people are flying, choose between two aircraft layouts, assign seats on a visual seat map, optionally add meals, and see a live cost breakdown.

> **Live demo:** `https://<your-username>.github.io/Flight-Seat-Selection-Passenger-Management/` (also deployable to Vercel as-is)

---

## Features

- **Passenger management** - select 1-7 passengers, switch between them, see each person's assigned seat and charges at a glance.
- **Two aircraft layouts** - `3-2` (A B C ⌣ D E, 12 rows) and `2-3-2` (A B ⌣ D E F ⌣ G H, 10 rows), switchable any time with row numbers, seat labels and aisle gaps.
- **Four seat states** - available, occupied (pre-checked-in, not clickable), selected (current passenger) and taken (another passenger in your group).
- **Three pricing categories** - Standard (₹0/free), Premium ₹250 (windows) and Extra Legroom ₹350 (aisle-side front rows). Paid seats show a price badge; the legend explains everything.
- **Live price summary** - per-passenger breakdown (seat + meal) and a grand total that updates the instant a seat is selected, changed or removed.
- **Meals (bonus)** - one meal per passenger, free and paid options, included in the total.
- **Feedback & states** - loading skeleton, empty-state hints, toast messages for invalid actions (occupied seat, seat taken by another passenger, layout change clearing seats), fully responsive down to mobile.

## Getting started

```bash
npm install
npm run dev      # local dev server
npm run build    # production build (dist/)
npm run preview  # preview the production build
node smoke-test.mjs  # 21 logic/render checks, no browser needed
```

---

## State management (README requirement)

A single **React Context (`BookingContext`) + `useReducer`** owns the whole booking state. No external state library is needed at this scale, and the reducer keeps every mutation rule in one auditable place.

### State shape

```js
{
  layoutId: '3-2',                  // active aircraft configuration
  passengers: [                     // ordered list; assignments live HERE
    { id: 'p1', name: 'Aarav Sharma', seatId: '1C', mealId: 'veg' },
    { id: 'p2', name: 'Diya Patel',   seatId: null, mealId: 'none' },
  ],
  selectedPassengerId: 'p1',        // who is currently picking a seat
}
```

### Core design decision: occupancy is *derived*, never stored

The seat map itself is **not** state. `generateSeatMap(layoutId)` produces a static array of seats (id, row, letter, category, price, `occupied` flag for pre-checked-in seats), memoised per layout. Who sits where is computed from the passenger list:

```js
getSeatStatus(seat):
  holder = passengers.find(p => p.seatId === seat.id)
  holder === selectedPassenger  → 'selected'   // green-blue, current picker
  holder (someone else)         → 'taken'      // blocked, toast on click
  seat.occupied                 → 'occupied'   // blocked, disabled
  otherwise                     → 'available'
```

Because a passenger object holds a single `seatId` string, **one seat per passenger is guaranteed by the data shape** - there is no list of "assigned seats" that could drift out of sync.

### Reducer actions

| Action | Behaviour |
|---|---|
| `SET_PASSENGER_COUNT` | Grows/shrinks the list; shrinking drops the removed passengers (and their seat picks with them); keeps a valid `selectedPassengerId` |
| `SELECT_PASSENGER` | Switches who is picking; all previous assignments are retained (they live on each passenger) |
| `ASSIGN_SEAT` | Assigns the seat to the *selected* passenger. Guard: if somebody **else** holds the seat → no-op. If the current passenger re-clicks their own seat → **toggles it off** |
| `REMOVE_SEAT` | Clears one passenger's seat (also via the ✕ on their card) |
| `SWITCH_LAYOUT` | Rebuilds the seat map; assignments pointing at seats that don't exist on the new aircraft are cleared (user is notified via toast) |
| `SELECT_MEAL` | Sets one meal per passenger |

## Seat assignment logic (README requirement)

1. The user selects a passenger (or the first one is selected by default).
2. Clicking an **available** seat dispatches `ASSIGN_SEAT`; the context layer first validates the seat's derived status and shows a toast instead of dispatching for invalid clicks (occupied / taken).
3. The reducer swaps the selected passenger's `seatId` - if they had a seat, it simply moves, so the old seat automatically frees up (it is no longer referenced by anyone).
4. Preventing double-booking needs no extra bookkeeping: a seat is "taken" exactly when some passenger's `seatId` equals its id, and the reducer guard makes a second claim impossible.
5. Totals are computed during the context-value memoisation (`seatTotal`, `mealTotal`, `grandTotal`), so **any** state change that affects assignments re-renders the summary immediately - no manual recalculation events.

## Pricing model (`src/data/seatGenerator.js`)

| Category | Price | Where |
|---|---|---|
| Standard | ₹0 | everything else (matches sample seats 1A, 1B, 1D, 2B) |
| Premium | ₹250 | window seats (matches sample 1E) |
| Extra Legroom | ₹350 | aisle-side seats in rows 1-2 (matches sample 1C, 2A) |

Occupied seats are seeded with a deterministic PRNG (~30%), so the map looks realistic but is identical on every reload.

## Project structure

```
src/
├── data/                  # mock data layer
│   ├── layouts.js         #   3-2 & 2-3-2 definitions, aisle helpers
│   ├── seatGenerator.js   #   pricing categories, occupied-seat seeding
│   └── meals.js           #   meal options (free + paid)
├── context/
│   └── BookingContext.jsx # useReducer + provider + derived totals/status
├── components/
│   ├── Header.jsx
│   ├── PassengerPanel/    # count stepper, passenger cards
│   ├── SeatMap/           # SeatMap, SeatRow, Seat, LayoutSwitcher, SeatLegend
│   ├── MealPanel/         # bonus: per-passenger meal selection
│   ├── PriceSummary/      # breakdown + grand total + confirm
│   └── ui/                # ToastStack, SkeletonScreen
├── utils/formatPrice.js   # Intl INR formatting
└── index.css              # design tokens + all styles
```

## Edge cases handled

- Clicking occupied seats or seats held by other passengers → blocked with an explanatory toast.
- Reducing passenger count removes their seat/meal picks.
- Switching aircraft layout clears assignments to seats that no longer exist and tells the user.
- Re-clicking your own seat releases it (toggle).
- Confirm button stays disabled until every passenger has a seat.
- Seat map scrolls horizontally on narrow screens; panels stack below 900px.

## Deployment

Hosted on **GitHub Pages** from the `gh-pages` branch:

```bash
npm run build
npm run deploy   # pushes dist/ to the gh-pages branch (gh-pages package)
```

Live URL: `https://swapnil26-art.github.io/flight-seat-selection-passenger-management/`

`vite.config.js` uses a **relative base (`./`)**, so the same build works on GitHub Pages (repo sub-path), Vercel (domain root) and any other static host — no per-host config needed. (A GitHub Actions workflow is an alternative once Actions are enabled on the account.)
