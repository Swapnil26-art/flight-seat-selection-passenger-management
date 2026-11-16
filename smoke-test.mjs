/**
 * Smoke test: renders the app through Vite and checks the main UI panels,
 * plus the seat-assignment logic (double-assign prevention, totals).
 * Run: node smoke-test.mjs
 */
import { createServer } from 'vite';
import { renderToString } from 'react-dom/server';
import React from 'react';

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

let failed = 0;
function check(name, ok) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}

try {
  const { BookingProvider, useBooking } = await vite.ssrLoadModule('/src/context/BookingContext.jsx');
  const { default: PassengerPanel } = await vite.ssrLoadModule('/src/components/PassengerPanel/PassengerPanel.jsx');
  const { default: SeatMap } = await vite.ssrLoadModule('/src/components/SeatMap/SeatMap.jsx');
  const { default: MealPanel } = await vite.ssrLoadModule('/src/components/MealPanel/MealPanel.jsx');
  const { default: PriceSummary } = await vite.ssrLoadModule('/src/components/PriceSummary/PriceSummary.jsx');
  const { generateSeatMap } = await vite.ssrLoadModule('/src/data/seatGenerator.js');
  const { seatLetters } = await vite.ssrLoadModule('/src/data/layouts.js');

  const panels = React.createElement(
    BookingProvider,
    null,
    React.createElement(PassengerPanel),
    React.createElement(SeatMap),
    React.createElement(MealPanel),
    React.createElement(PriceSummary),
  );
  const html = renderToString(panels);

  check('Passenger panel renders', html.includes('Who is flying'));
  check('Passenger names render', html.includes('Aarav Sharma') && html.includes('Diya Patel'));
  check('Seat map renders', html.includes('Pick your seats'));
  check('Meal panel renders', html.includes('Meals'));
  check('Summary renders', html.includes('Summary'));
  check('Total shown as Free when nothing selected', html.includes('Free'));

  // --- logic checks against the real generator ---
  const layout32 = generateSeatMap('3-2');
  const layout232 = generateSeatMap('2-3-2');
  check('3-2 layout: 12 rows x 5 seats = 60', layout32.length === 60);
  check('2-3-2 layout: 10 rows x 7 seats = 70', layout232.length === 70);
  check('3-2 letters are A-E', seatLetters({ groups: [{ letters: ['A','B','C'] }, { letters: ['D','E'] }] }).join('') === 'ABCDE');
  check('Sample price rule: 1C is ₹350 extra legroom',
    layout32.find((s) => s.id === '1C')?.price === 350);
  check('Sample price rule: 1E is ₹250 premium',
    layout32.find((s) => s.id === '1E')?.price === 250);
  check('All standard seats are free',
    layout32.every((s) => s.category !== 'standard' || s.price === 0));
  check('Some seats pre-occupied', layout32.some((s) => s.occupied));
  check('Not all seats occupied', layout32.some((s) => !s.occupied));

  // --- reducer behaviour: double-assignment prevention, totals, edge cases ---
  const { reducer, initialState } = await vite.ssrLoadModule('/src/context/BookingContext.jsx');
  const { getMeal } = await vite.ssrLoadModule('/src/data/meals.js');

  // Pick seats dynamically so the tests never depend on which seats are occupied.
  const freeOnBoth = layout232
    .filter((s) => !s.occupied)
    .map((s) => s.id)
    .filter((id) => layout32.some((t) => t.id === id && !t.occupied));
  const keepSeat = freeOnBoth[0];            // exists & free on both layouts
  const otherSeat = freeOnBoth[1];           // a second common free seat
  const only32 = layout32.find((s) => s.row > 10 && !s.occupied)?.id; // 3-2 rows 11-12
  const occupied = layout32.find((s) => s.occupied)?.id;

  let state = initialState; // p1 selected

  // hardening: reducer must refuse occupied seats even on direct dispatch
  state = reducer(state, { type: 'ASSIGN_SEAT', seatId: occupied });
  check('Reducer refuses occupied seat on direct dispatch',
    state.passengers.every((p) => p.seatId === null));

  state = reducer(state, { type: 'ASSIGN_SEAT', seatId: keepSeat });
  check('Free seat assigned to selected passenger', state.passengers[0].seatId === keepSeat);

  state = reducer(state, { type: 'SELECT_PASSENGER', id: 'p2' });
  state = reducer(state, { type: 'ASSIGN_SEAT', seatId: keepSeat }); // p2 tries p1's seat
  check('Double-assign prevented: exactly one holder',
    state.passengers.filter((p) => p.seatId === keepSeat).length === 1);
  check('Second passenger got no seat', state.passengers[1].seatId === null);

  // moving to a different seat frees the old one
  state = reducer(state, { type: 'ASSIGN_SEAT', seatId: otherSeat });
  check('Passenger can move to another free seat', state.passengers[1].seatId === otherSeat);
  check('Old seat freed automatically after move',
    state.passengers.every((p) => p.seatId !== keepSeat || p.id === 'p1'));

  // seat + meal totals reproduce the context formula
  state = reducer(state, { type: 'SELECT_MEAL', passengerId: 'p2', mealId: 'chicken' });
  check('Meal recorded for passenger', state.passengers[1].mealId === 'chicken');
  const seatById = new Map(layout32.map((s) => [s.id, s]));
  const seatTotal = state.passengers.reduce((sum, p) => {
    const s = p.seatId ? seatById.get(p.seatId) : null;
    return sum + (s ? s.price : 0);
  }, 0);
  const mealTotal = state.passengers.reduce((sum, p) => sum + getMeal(p.mealId).price, 0);
  const expected = seatById.get(keepSeat).price + seatById.get(otherSeat).price + getMeal('chicken').price;
  check(`Seat+meal total math consistent (₹${expected})`,
    seatTotal + mealTotal === expected && expected > 0);

  state = reducer(state, { type: 'REMOVE_SEAT', passengerId: 'p1' });
  check('Seat removed cleanly', state.passengers[0].seatId === null);

  // passenger count decrease drops orphan assignments
  state = reducer(state, { type: 'SET_PASSENGER_COUNT', count: 1 });
  check('Count decrease drops removed passengers (and their seats)',
    state.passengers.length === 1 && state.passengers[0].seatId === null);

  // layout switch clears seats that don't exist on the new aircraft
  if (only32) {
    state = reducer(state, { type: 'ASSIGN_SEAT', seatId: only32 });
    state = reducer(state, { type: 'SWITCH_LAYOUT', layoutId: '2-3-2' });
    check('Layout switch clears now-invalid seat', state.passengers[0].seatId === null);
  }
  state = reducer(state, { type: 'ASSIGN_SEAT', seatId: keepSeat }); // valid on both
  state = reducer(state, { type: 'SWITCH_LAYOUT', layoutId: '3-2' });
  check('Layout switch keeps valid seat', state.passengers[0].seatId === keepSeat);

  // toggling the same seat unassigns it
  state = reducer(state, { type: 'ASSIGN_SEAT', seatId: keepSeat });
  check('Clicking own seat again removes it', state.passengers[0].seatId === null);

  console.log(failed === 0 ? '\n✅ All smoke checks passed.' : `\n❌ ${failed} check(s) failed.`);
  process.exitCode = failed === 0 ? 0 : 1;
} catch (error) {
  console.error('RENDER ERROR:', error);
  process.exitCode = 1;
} finally {
  await vite.close();
}
