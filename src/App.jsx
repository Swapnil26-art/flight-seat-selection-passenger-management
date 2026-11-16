import { useEffect, useState } from 'react';
import { useBooking } from './context/BookingContext';
import Header from './components/Header';
import PassengerPanel from './components/PassengerPanel/PassengerPanel';
import SeatMap from './components/SeatMap/SeatMap';
import MealPanel from './components/MealPanel/MealPanel';
import PriceSummary from './components/PriceSummary/PriceSummary';
import ToastStack from './components/ui/ToastStack';
import SkeletonScreen from './components/ui/SkeletonScreen';

export default function App() {
  // Simulated seat-data fetch so the loading state is demonstrable.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app">
      <Header />

      {loading ? (
        <SkeletonScreen />
      ) : (
        <main className="app-grid">
          <aside className="app-side">
            <PassengerPanel />
            <PriceSummary />
          </aside>

          <section className="app-main">
            <SeatMap />
            <MealPanel />
          </section>
        </main>
      )}

      <ToastStack />
    </div>
  );
}
