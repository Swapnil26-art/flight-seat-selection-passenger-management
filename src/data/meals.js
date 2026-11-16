/** Meal options - one per passenger. price ₹0 = complimentary. */
export const MEAL_OPTIONS = [
  { id: 'none', label: 'No meal', price: 0 },
  { id: 'veg', label: 'Veg Thali', price: 0 },
  { id: 'paneer-wrap', label: 'Paneer Wrap', price: 180 },
  { id: 'chicken', label: 'Chicken Rice', price: 250 },
  { id: 'snack-box', label: 'Snack Box', price: 150 },
  { id: 'juice', label: 'Fresh Juice', price: 90 },
];

export function getMeal(mealId) {
  return MEAL_OPTIONS.find((meal) => meal.id === mealId) || MEAL_OPTIONS[0];
}
