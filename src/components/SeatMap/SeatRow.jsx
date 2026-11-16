import Seat from './Seat';
import { isAisleStart } from '../../data/layouts';

/** One cabin row: row number, then seats with aisle gaps where the layout says so. */
export default function SeatRow({ row, seats, layout }) {
  return (
    <div className="seat-row" role="row" aria-label={`Row ${row}`}>
      <span className="seat-row__number">{row}</span>
      <div className="seat-row__seats">
        {seats.map((seat) => (
          <Seat key={seat.id} seat={seat} aisleBefore={isAisleStart(layout, seat.letter)} />
        ))}
      </div>
      <span className="seat-row__number seat-row__number--end" aria-hidden="true">{row}</span>
    </div>
  );
}
