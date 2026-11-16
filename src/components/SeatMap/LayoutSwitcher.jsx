import { useBooking } from '../../context/BookingContext';
import { LAYOUT_IDS, LAYOUTS } from '../../data/layouts';

/** Toggle between the two aircraft configurations. */
export default function LayoutSwitcher() {
  const { layoutId, switchLayout } = useBooking();

  return (
    <div className="layout-switcher" role="tablist" aria-label="Aircraft layout">
      {LAYOUT_IDS.map((id) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={id === layoutId}
          className={`layout-switcher__option ${id === layoutId ? 'layout-switcher__option--active' : ''}`}
          onClick={() => switchLayout(id)}
        >
          {LAYOUTS[id].name}
        </button>
      ))}
    </div>
  );
}
