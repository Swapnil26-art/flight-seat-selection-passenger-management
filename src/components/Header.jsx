export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <span className="header-logo" aria-hidden="true">✈️</span>
          <div>
            <h1 className="header-title">SkySelect</h1>
            <p className="header-subtitle">Flight AI-283 · Mumbai → Delhi · 14 Nov</p>
          </div>
        </div>
        <span className="header-tag">Boarding pass not required 😉</span>
      </div>
    </header>
  );
}
