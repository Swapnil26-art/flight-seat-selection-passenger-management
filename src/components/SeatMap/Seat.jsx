import { useBooking } from '../../context/BookingContext';
import { formatPrice } from '../../utils/formatPrice';

/**
 * A single seat button. Four visual states:
 * available · occupied (check-in closed) · selected (this passenger) · taken (another passenger)
 */
export default function Seat({ seat, aisleBefore }) {
  const { getSeatStatus, assignSeat, selectedPassenger } = useBooking();
  const status = getSeatStatus(seat);
  const isPaid = seat.price > 0;

  const label =
    status === 'selected'
      ? `Seat ${seat.id}, selected for ${selectedPassenger?.name ?? 'you'}`
      : status === 'taken'
        ? `Seat ${seat.id}, taken by another passenger`
        : status === 'occupied'
          ? `Seat ${seat.id}, occupied`
          : `Seat ${seat.id}, ${isPaid ? formatPrice(seat.price) : 'free'}`;

  return (
    <button
      type="button"
      className={[
        'seat',
        `seat--${status}`,
        `seat--${seat.category}`,
        aisleBefore ? 'seat--aisle-before' : '',
      ].join(' ')}
      onClick={() => assignSeat(seat)}
      disabled={status === 'occupied' || status === 'taken'}
      title={label}
      aria-label={label}
      data-price={isPaid ? `+₹${seat.price}` : ''}
    >
      {seat.letter}
    </button>
  );
}
