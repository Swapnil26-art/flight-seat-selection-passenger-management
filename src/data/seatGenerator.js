import { LAYOUTS, seatLetters } from './layouts';

/**
 * Pricing categories, ordered for the legend. Price ₹0 means the seat is
 * free to pick (standard seating) - exactly like the sample data table.
 */
export const SEAT_CATEGORIES = {
  standard: { label: 'Standard', price: 0 },
  premium: { label: 'Premium', price: 250 },
  extraLegroom: { label: 'Extra Legroom', price: 350 },
};

/**
 * Category rules per row, mirroring the sample data:
 *   1A/1B/1D → Standard ₹0 · 1C → Extra Legroom ₹350 · 1E → Premium ₹250 …
 *
 * First two rows have extra legroom on the aisle side, windows are premium,
 * everything else is standard (free).
 */
function categoryFor(layoutId, row, letter) {
  const letters = seatLetters(LAYOUTS[layoutId]);
  const first = letters[0];
  const last = letters[letters.length - 1];

  if (row <= 2 && (letter === 'C' || letter === 'D' || letter === 'F')) {
    return 'extraLegroom'; // aisle-side front rows
  }
  if (letter === first || letter === last) {
    return 'premium'; // window seats
  }
  return 'standard';
}

/** Small deterministic PRNG so the occupied seats look random but stay stable. */
function pseudoRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Builds the full seat map for a layout.
 * Every seat: { id, row, letter, category, price, occupied }
 * Occupied seats are "already checked-in passengers" (~30%, deterministic).
 */
export function generateSeatMap(layoutId) {
  const layout = LAYOUTS[layoutId];
  const seats = [];

  for (let row = 1; row <= layout.rows; row++) {
    for (const letter of seatLetters(layout)) {
      const id = `${row}${letter}`;
      const category = categoryFor(layoutId, row, letter);
      const roll = pseudoRandom(row * 31 + letter.charCodeAt(0) * 7);
      seats.push({
        id,
        row,
        letter,
        category,
        price: SEAT_CATEGORIES[category].price,
        occupied: roll < 0.3,
      });
    }
  }
  return seats;
}
