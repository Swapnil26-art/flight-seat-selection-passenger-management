import { useBooking } from '../../context/BookingContext';
import LayoutSwitcher from './LayoutSwitcher';
import SeatRow from './SeatRow';
import SeatLegend from './SeatLegend';

/** The interactive cabin: layout switcher, rows, legend. */
export default function SeatMap() {
  const { layout, seatMap, selectedPassenger, passengers } = useBooking();

  const rows = Array.from({ length: layout.rows }, (_, i) => i + 1);
  const unassigned = passengers.filter((p) => !p.seatId).length;

  return (
    <section className="panel" aria-label="Seat map">
      <div className="seat-map-header">
        <h2 className="panel__title">2 · Pick your seats</h2>
        <LayoutSwitcher />
      </div>

      {unassigned > 0 && (
        <p className="seat-map-banner">
          {selectedPassenger
            ? `${unassigned} passenger${unassigned > 1 ? 's' : ''} still need${unassigned > 1 ? '' : 's'} a seat - selecting for ${selectedPassenger.name}.`
            : ''}
        </p>
      )}

      <div className="cockpit" aria-hidden="true">✈︎</div>

      <div className="seat-grid" role="grid">
        {rows.map((row) => (
          <SeatRow
            key={row}
            row={row}
            layout={layout}
            seats={seatMap.filter((seat) => seat.row === row)}
          />
        ))}
      </div>

      <SeatLegend />
    </section>
  );
}
