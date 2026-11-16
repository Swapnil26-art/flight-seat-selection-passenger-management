import { useBooking } from '../../context/BookingContext';

const MIN_PASSENGERS = 1;
const MAX_PASSENGERS = 7;

/** Stepper to choose how many passengers are flying. */
export default function PassengerCountSelector() {
  const { passengers, setPassengerCount } = useBooking();
  const count = passengers.length;

  return (
    <div className="count-selector">
      <span className="count-selector__label">Passengers</span>
      <div className="stepper" role="group" aria-label="Number of passengers">
        <button
          type="button"
          className="stepper__btn"
          onClick={() => setPassengerCount(count - 1)}
          disabled={count <= MIN_PASSENGERS}
          aria-label="Remove a passenger"
        >
          −
        </button>
        <span className="stepper__value">{count}</span>
        <button
          type="button"
          className="stepper__btn"
          onClick={() => setPassengerCount(count + 1)}
          disabled={count >= MAX_PASSENGERS}
          aria-label="Add a passenger"
        >
          +
        </button>
      </div>
    </div>
  );
}
