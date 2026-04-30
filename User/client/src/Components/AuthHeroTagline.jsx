/** Seamless horizontal scroll for the auth side-panel tagline. Respects prefers-reduced-motion. */
export default function AuthHeroTagline({ text, className = "" }) {
  const t = String(text ?? "").trim();
  if (!t) return null;
  return (
    <div className={className}>
      <p className="sr-only">{t}</p>
      <div className="auth-hero-tagline-outer" aria-hidden="true">
        <div className="auth-hero-tagline-track">
          <span className="auth-hero-tagline-chunk">{t}</span>
          {/* <span className="auth-hero-tagline-chunk">{t}</span> */}
        </div>
      </div>
    </div>
  );
}
