import { useBooking } from '../../context/BookingContext';
import PassengerCountSelector from './PassengerCountSelector';
import PassengerCard from './PassengerCard';

/** Left rail: passenger count + list of passengers with their seats. */
export default function PassengerPanel() {
  const { passengers, selectedPassenger } = useBooking();

  return (
    <section className="panel" aria-label="Passengers">
      <h2 className="panel__title">1 · Who is flying?</h2>
      <PassengerCountSelector />

      <ul className="passenger-list">
        {passengers.map((passenger) => (
          <li key={passenger.id}>
            <PassengerCard passenger={passenger} />
          </li>
        ))}
      </ul>

      {selectedPassenger ? (
        <p className="panel__hint">
          Picking seats for <strong>{selectedPassenger.name}</strong> - tap any
          available seat on the map.
        </p>
      ) : (
        <p className="panel__hint panel__hint--empty">Add a passenger to start selecting seats.</p>
      )}
    </section>
  );
}
