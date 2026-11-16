import { SEAT_CATEGORIES } from '../../data/seatGenerator';
import { formatPrice } from '../../utils/formatPrice';

/** Explains seat states + what each price category costs. */
export default function SeatLegend() {
  return (
    <div className="legend">
      <div className="legend__group">
        <span className="legend__item"><span className="seat seat--available" /> Available</span>
        <span className="legend__item"><span className="seat seat--selected" /> Your pick</span>
        <span className="legend__item"><span className="seat seat--taken" /> Other passenger</span>
        <span className="legend__item"><span className="seat seat--occupied" /> Occupied</span>
      </div>
      <div className="legend__group">
        {Object.entries(SEAT_CATEGORIES).map(([key, category]) => (
          <span key={key} className="legend__item">
            <span className={`seat seat--available seat--${key}`} />
            {category.label} · {category.price === 0 ? 'Free' : formatPrice(category.price)}
          </span>
        ))}
      </div>
    </div>
  );
}
