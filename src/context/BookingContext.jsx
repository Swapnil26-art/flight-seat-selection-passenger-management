import { createContext, useCallback, useContext, useMemo, useReducer, useState } from 'react';
import { LAYOUTS } from '../data/layouts';
import { generateSeatMap } from '../data/seatGenerator';
import { getMeal } from '../data/meals';

/**
 * Single source of truth for the whole booking flow.
 *
 * Seat assignments live on the passenger (passenger.seatId), and seat
 * occupancy is always *derived* from that list plus the pre-seeded
 * occupied seats - so a seat can never silently belong to two people.
 */

const PASSENGER_NAMES = [
  'Aarav Sharma', 'Diya Patel', 'Rohan Mehta', 'Anaya Iyer',
  'Kabir Khan', 'Isha Nair', 'Vihaan Gupta',
];

function makePassengers(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i + 1}`,
    name: PASSENGER_NAMES[i],
    seatId: null,
    mealId: 'none',
  }));
}

const initialState = {
  layoutId: '3-2',
  passengers: makePassengers(2),
  selectedPassengerId: 'p1',
};

// Exported for unit testing the assignment rules in isolation.
export { reducer, initialState };

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PASSENGER_COUNT': {
      const count = action.count;
      const passengers = Array.from({ length: count }, (_, i) =>
        state.passengers[i] || { ...makePassengers(count)[i] },
      );
      // Dropping the count removes those passengers' seat/meal picks with them.
      const selected = passengers.some((p) => p.id === state.selectedPassengerId)
        ? state.selectedPassengerId
        : passengers[0].id;
      return { ...state, passengers, selectedPassengerId: selected };
    }

    case 'SELECT_PASSENGER':
      return { ...state, selectedPassengerId: action.id };

    case 'ASSIGN_SEAT': {
      const seatId = action.seatId;
      // Defense-in-depth: never accept a seat that doesn't exist or is
      // pre-occupied, even if a caller skips the context-level validation.
      const seat = generateSeatMap(state.layoutId).find((s) => s.id === seatId);
      if (!seat || seat.occupied) return state;

      const holder = state.passengers.find((p) => p.seatId === seatId);
      // Only block when somebody ELSE already holds the seat - if the
      // current passenger holds it, clicking again removes it (toggle).
      if (holder && holder.id !== state.selectedPassengerId) return state;

      return {
        ...state,
        passengers: state.passengers.map((p) => {
          if (p.id !== state.selectedPassengerId) return p;
          // Re-selecting the same seat removes it (toggle behaviour).
          return p.seatId === seatId ? { ...p, seatId: null } : { ...p, seatId };
        }),
      };
    }

    case 'REMOVE_SEAT':
      return {
        ...state,
        passengers: state.passengers.map((p) =>
          p.id === action.passengerId ? { ...p, seatId: null } : p,
        ),
      };

    case 'SWITCH_LAYOUT': {
      if (action.layoutId === state.layoutId) return state;
      const validIds = new Set(generateSeatMap(action.layoutId).map((s) => s.id));
      return {
        ...state,
        layoutId: action.layoutId,
        // Seats that don't exist on the new aircraft can't be kept.
        passengers: state.passengers.map((p) =>
          p.seatId && validIds.has(p.seatId) ? p : { ...p, seatId: null },
        ),
      };
    }

    case 'SELECT_MEAL':
      return {
        ...state,
        passengers: state.passengers.map((p) =>
          p.id === action.passengerId ? { ...p, mealId: action.mealId } : p,
        ),
      };

    default:
      return state;
  }
}

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, tone = 'error') => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, message, tone }]);
    setTimeout(() => {
      setToasts((list) => list.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const seatMap = useMemo(() => generateSeatMap(state.layoutId), [state.layoutId]);
  const seatById = useMemo(
    () => new Map(seatMap.map((seat) => [seat.id, seat])),
    [seatMap],
  );

  /** 'available' | 'occupied' | 'selected' | 'taken' */
  const getSeatStatus = useCallback(
    (seat) => {
      const holder = state.passengers.find((p) => p.seatId === seat.id);
      if (holder && holder.id === state.selectedPassengerId) return 'selected';
      if (holder) return 'taken';
      if (seat.occupied) return 'occupied';
      return 'available';
    },
    [state.passengers, state.selectedPassengerId],
  );

  const assignSeat = useCallback(
    (seat) => {
      if (!state.selectedPassengerId) {
        addToast('Select a passenger first, then pick a seat.');
        return;
      }
      const status = getSeatStatus(seat);
      if (status === 'occupied') {
        addToast(`Seat ${seat.id} is already taken by another guest.`);
        return;
      }
      if (status === 'taken') {
        addToast(`Seat ${seat.id} is assigned to another passenger.`);
        return;
      }
      // Changing to a different seat deserves visible feedback too.
      const mover = state.passengers.find((p) => p.id === state.selectedPassengerId);
      if (mover?.seatId && mover.seatId !== seat.id) {
        addToast(`${mover.name} moved from seat ${mover.seatId} to ${seat.id}.`, 'info');
      }
      dispatch({ type: 'ASSIGN_SEAT', seatId: seat.id });
    },
    [state.selectedPassengerId, getSeatStatus, addToast],
  );

  const value = useMemo(() => {
    const layout = LAYOUTS[state.layoutId];
    const selectedPassenger =
      state.passengers.find((p) => p.id === state.selectedPassengerId) || null;

    const seatTotal = state.passengers.reduce((sum, p) => {
      const seat = p.seatId ? seatById.get(p.seatId) : null;
      return sum + (seat ? seat.price : 0);
    }, 0);

    const mealTotal = state.passengers.reduce(
      (sum, p) => sum + getMeal(p.mealId).price,
      0,
    );

    return {
      ...state,
      layout,
      seatMap,
      seatById,
      selectedPassenger,
      seatTotal,
      mealTotal,
      grandTotal: seatTotal + mealTotal,
      toasts,
      addToast,
      getSeatStatus,
      setPassengerCount: (count) => dispatch({ type: 'SET_PASSENGER_COUNT', count }),
      selectPassenger: (id) => dispatch({ type: 'SELECT_PASSENGER', id }),
      assignSeat,
      removeSeat: (passengerId) => dispatch({ type: 'REMOVE_SEAT', passengerId }),
      switchLayout: (layoutId) => {
        const dropped = state.passengers.filter(
          (p) => p.seatId && !generateSeatMap(layoutId).some((s) => s.id === p.seatId),
        );
        dispatch({ type: 'SWITCH_LAYOUT', layoutId });
        if (dropped.length > 0) {
          addToast(
            `${dropped.length} seat assignment(s) cleared - those seats don't exist on this aircraft.`,
            'info',
          );
        }
      },
      selectMeal: (passengerId, mealId) =>
        dispatch({ type: 'SELECT_MEAL', passengerId, mealId }),
      dismissToast: (id) =>
        setToasts((list) => list.filter((toast) => toast.id !== id)),
    };
  }, [state, seatMap, seatById, toasts, addToast, getSeatStatus, assignSeat]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used inside <BookingProvider>');
  return context;
}
