export default function Nav({ here, meta }) {
  const link = (href, label, key) => <a href={href} className={here === key ? "on" : ""} aria-current={here === key ? "page" : undefined}>{label}</a>;
  return (
    <header className="nav">
      <a href="/" className="brand">Signal Brief</a>
      <nav>{link("/", "Brief", "brief")}{link("/howto/", "How-to", "howto")}{link("/archive/", "Archive", "archive")}</nav>
      {meta && <p className="meta">{meta}</p>}
    </header>
  );
}
