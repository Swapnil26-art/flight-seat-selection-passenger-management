import { useBooking } from '../../context/BookingContext';
import { MEAL_OPTIONS, getMeal } from '../../data/meals';
import { formatPrice } from '../../utils/formatPrice';

/** Bonus feature: one meal choice per passenger, free or paid. */
export default function MealPanel() {
  const { passengers, selectMeal } = useBooking();

  return (
    <section className="panel" aria-label="Meal selection">
      <h2 className="panel__title">3 · Meals (optional)</h2>

      <div className="meal-list">
        {passengers.map((passenger) => {
          const current = getMeal(passenger.mealId);
          return (
            <div key={passenger.id} className="meal-row">
              <label className="meal-row__label" htmlFor={`meal-${passenger.id}`}>
                {passenger.name}
                <span className="meal-row__current">
                  {current.id !== 'none' ? `${current.label} · ${current.price === 0 ? 'Free' : formatPrice(current.price)}` : 'No meal selected'}
                </span>
              </label>
              <select
                id={`meal-${passenger.id}`}
                className="meal-row__select"
                value={passenger.mealId}
                onChange={(event) => selectMeal(passenger.id, event.target.value)}
              >
                {MEAL_OPTIONS.map((meal) => (
                  <option key={meal.id} value={meal.id}>
                    {meal.label} {meal.price === 0 ? '(Free)' : `(+₹${meal.price})`}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </section>
  );
}
