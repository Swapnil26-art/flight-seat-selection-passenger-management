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
  const free = layout32.find((s) => !s.occupied);

  let state = initialState;
  state = reducer(state, { type: 'ASSIGN_SEAT', seatId: free.id });          // p1 takes it
  state = reducer(state, { type: 'SELECT_PASSENGER', id: 'p2' });
  state = reducer(state, { type: 'ASSIGN_SEAT', seatId: free.id });          // p2 tries same seat

  const holders = state.passengers.filter((p) => p.seatId === free.id);
  check('Double-assign prevented: exactly one holder', holders.length === 1);
  check('Second passenger got no seat', state.passengers[1].seatId === null);

  state = reducer(state, { type: 'REMOVE_SEAT', passengerId: 'p1' });
  check('Seat removed cleanly', state.passengers[0].seatId === null);

  // passenger count decrease drops orphan assignments
  state = reducer(state, { type: 'ASSIGN_SEAT', seatId: free.id });
  state = reducer(state, { type: 'SET_PASSENGER_COUNT', count: 1 });
  check(
    'Count decrease drops removed passengers (and their seats)',
    state.passengers.length === 1 && state.passengers[0].seatId === null,
  );

  // layout switch clears seats that don't exist on the new aircraft
  state = reducer(state, { type: 'ASSIGN_SEAT', seatId: '12E' }); // exists on 3-2 only
  state = reducer(state, { type: 'SWITCH_LAYOUT', layoutId: '2-3-2' });
  check('Layout switch clears now-invalid seat', state.passengers[0].seatId === null);
  state = reducer(state, { type: 'ASSIGN_SEAT', seatId: '5E' }); // exists on both
  state = reducer(state, { type: 'SWITCH_LAYOUT', layoutId: '3-2' });
  check('Layout switch keeps valid seat', state.passengers[0].seatId === '5E');

  // toggling the same seat unassigns it
  state = reducer(state, { type: 'ASSIGN_SEAT', seatId: '5E' });
  check('Clicking own seat again removes it', state.passengers[0].seatId === null);

  console.log(failed === 0 ? '\n✅ All smoke checks passed.' : `\n❌ ${failed} check(s) failed.`);
  process.exitCode = failed === 0 ? 0 : 1;
} catch (error) {
  console.error('RENDER ERROR:', error);
  process.exitCode = 1;
} finally {
  await vite.close();
}
