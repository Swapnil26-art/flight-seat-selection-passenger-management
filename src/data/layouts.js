/**
 * Aircraft layout definitions.
 *
 * A layout describes how one row of the cabin is split into seat groups
 * separated by aisles. `letters` are the seat labels inside each group.
 *
 *   3-2   →  A B C   ⌣   D E
 *   2-3-2 →  A B  ⌣  D E F  ⌣  G H
 */
export const LAYOUTS = {
  '3-2': {
    id: '3-2',
    name: 'Airbus A320 · 3-2',
    groups: [
      { letters: ['A', 'B', 'C'] },
      { letters: ['D', 'E'] },
    ],
    rows: 12,
  },
  '2-3-2': {
    id: '2-3-2',
    name: 'Boeing 787 · 2-3-2',
    groups: [
      { letters: ['A', 'B'] },
      { letters: ['D', 'E', 'F'] },
      { letters: ['G', 'H'] },
    ],
    rows: 10,
  },
};

export const LAYOUT_IDS = Object.keys(LAYOUTS);

/** Flat ordered list of seat letters for a layout (A,B,C,D,E for 3-2). */
export function seatLetters(layout) {
  return layout.groups.flatMap((group) => group.letters);
}

/** True when there is an aisle to the left of this letter. */
export function isAisleStart(layout, letter) {
  return layout.groups.slice(1).some((group) => group.letters[0] === letter);
}
