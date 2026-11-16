import { useBooking } from '../../context/BookingContext';

/** Lightweight toast stack - feedback for invalid / informational actions. */
export default function ToastStack() {
  const { toasts, dismissToast } = useBooking();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          className={`toast toast--${toast.tone}`}
          onClick={() => dismissToast(toast.id)}
        >
          {toast.tone === 'info' ? 'ℹ️' : '⚠️'} {toast.message}
        </button>
      ))}
    </div>
  );
}
