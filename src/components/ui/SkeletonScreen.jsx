/** Shown while the (simulated) seat data loads. */
export default function SkeletonScreen() {
  return (
    <div className="skeleton" aria-label="Loading seat map">
      <div className="skeleton-panel" />
      <div className="skeleton-panel skeleton-panel--tall" />
      <p className="skeleton-note">Preparing your aircraft…</p>
    </div>
  );
}
