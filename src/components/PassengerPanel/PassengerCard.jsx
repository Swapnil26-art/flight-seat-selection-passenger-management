import { useBooking } from '../../context/BookingContext';
import { formatPrice } from '../../utils/formatPrice';

/** One passenger row: name, assigned seat, seat price, seat removal. */
export default function PassengerCard({ passenger }) {
  const { selectedPassengerId, selectPassenger, seatById, removeSeat } = useBooking();
  const isActive = passenger.id === selectedPassengerId;
  const seat = passenger.seatId ? seatById.get(passenger.seatId) : null;

  return (
    <button
      type="button"
      className={`passenger-card ${isActive ? 'passenger-card--active' : ''}`}
      onClick={() => selectPassenger(passenger.id)}
      aria-pressed={isActive}
    >
      <span className="passenger-card__avatar" aria-hidden="true">
        {passenger.name.charAt(0)}
      </span>

      <span className="passenger-card__details">
        <span className="passenger-card__name">{passenger.name}</span>
        {seat ? (
          <span className="passenger-card__seat">
            Seat <strong>{seat.id}</strong> · {seat.category === 'standard' ? 'Free' : formatPrice(seat.price)}
          </span>
        ) : (
          <span className="passenger-card__seat passenger-card__seat--empty">
            No seat selected
          </span>
        )}
      </span>

      {seat && (
        <span
          className="passenger-card__remove"
          role="button"
          tabIndex={0}
          aria-label={`Remove seat ${seat.id} from ${passenger.name}`}
          onClick={(event) => {
            event.stopPropagation();
            removeSeat(passenger.id);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.stopPropagation();
              removeSeat(passenger.id);
            }
          }}
        >
          ✕
        </span>
      )}
    </button>
  );
}
