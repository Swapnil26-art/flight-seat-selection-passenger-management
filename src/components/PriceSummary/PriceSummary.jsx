import { useBooking } from '../../context/BookingContext';
import { getMeal } from '../../data/meals';
import { formatPrice } from '../../utils/formatPrice';

/** Charge breakdown per passenger + live grand total. */
export default function PriceSummary() {
  const { passengers, seatById, seatTotal, mealTotal, grandTotal, addToast } = useBooking();

  const allSeated = passengers.length > 0 && passengers.every((p) => p.seatId);

  return (
    <section className="panel" aria-label="Price summary">
      <h2 className="panel__title">Summary</h2>

      <ul className="summary-lines">
        {passengers.map((passenger) => {
          const seat = passenger.seatId ? seatById.get(passenger.seatId) : null;
          const meal = getMeal(passenger.mealId);
          const seatCost = seat ? seat.price : 0;
          const mealCost = meal.price;

          return (
            <li key={passenger.id} className="summary-line">
              <div className="summary-line__what">
                <span>{passenger.name}</span>
                <span className="summary-line__detail">
                  {seat ? `Seat ${seat.id}` : 'No seat'} · {meal.id === 'none' ? 'no meal' : meal.label}
                </span>
              </div>
              <span className="summary-line__amount">
                {seatCost + mealCost === 0 ? 'Free' : formatPrice(seatCost + mealCost)}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="summary-totals">
        <div className="summary-totals__row">
          <span>Seats</span>
          <span>{formatPrice(seatTotal)}</span>
        </div>
        <div className="summary-totals__row">
          <span>Meals</span>
          <span>{formatPrice(mealTotal)}</span>
        </div>
        <div className="summary-totals__row summary-totals__row--grand">
          <span>Total</span>
          <span>{formatPrice(grandTotal)}</span>
        </div>
      </div>

      <button
        type="button"
        className="confirm-btn"
        disabled={!allSeated}
        onClick={() =>
          addToast('Boarding passes sent to your email ✈️ (demo)', 'info')
        }
      >
        {allSeated ? 'Confirm seats' : `Assign seats for all passengers to continue`}
      </button>
    </section>
  );
}
