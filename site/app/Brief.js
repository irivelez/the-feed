// Presentation only. Data comes from /api JSON (see lib/api.js).
const TAG = { new: "New", building: "Building", shift: "Shift" };
const SECTIONS = [
  { key: "today", title: "Today's AI", match: (i) => i.lens === "practical" || i.lens === "broad" },
  { key: "capital", title: "Quiet money", match: (i) => i.lens === "frontier-capital" },
  { key: "design", title: "Design", match: (i) => i.lens === "design" },
];

const time = (iso) => new Date(iso).toLocaleTimeString("en-US", { timeZone: "America/Bogota", hour: "numeric", minute: "2-digit" });
const day = (iso) => new Date(iso).toLocaleDateString("en-US", { timeZone: "America/Bogota", weekday: "short", month: "short", day: "numeric" });
const when = (iso, ref) => (day(iso) === day(ref) ? time(iso) : day(iso));
function Pic({ i, eager }) {
  return i.image
    ? <img src={i.image.src} alt={i.image.alt} loading={eager ? "eager" : "lazy"} />
    : <div className={`ph ${i.lens}`} aria-hidden="true" />;
}

function Card({ i, ref_ }) {
  return (
    <a className="card" href={i.source.url} target="_blank" rel="noopener" title={i.title}>
      <Pic i={i} />
      <h3>{i.title}</h3>
      <p>{i.soWhat}</p>
      <small>{i.momentum !== "new" && <b>{TAG[i.momentum]}</b>}{i.source.name} · {when(i.publishedAt, ref_)}</small>
    </a>
  );
}

export default function Brief({ brief, archived }) {
  const byId = Object.fromEntries(brief.items.map((i) => [i.id, i]));
  const top = new Set(brief.top3.map((t) => t.itemId));
  const rest = [...brief.items].filter((i) => !top.has(i.id)).sort((a, b) => b.importance - a.importance);
  const ref_ = brief.publishedAt;
  return (
    <main>
      <header>
        <h1>Signal Brief</h1>
        <p>{day(ref_)} · {brief.edition}{archived && <> · <a href="/">Latest</a></>}</p>
      </header>

      <section>
        <h2>Top 3</h2>
        <div className="top">
          {brief.top3.map((t, n) => {
            const i = byId[t.itemId];
            return i && (
              <a key={t.itemId} className={n === 0 ? "hero lead" : "hero"} href={i.source.url} target="_blank" rel="noopener" title={t.headline}>
                <Pic i={i} eager />
                <h3>{t.headline}</h3>
                <p>{t.whyItMatters}</p>
                <small>{i.source.name} · {when(i.publishedAt, ref_)}</small>
              </a>
            );
          })}
        </div>
      </section>

      {SECTIONS.map((s) => {
        const list = rest.filter(s.match);
        return list.length > 0 && (
          <section key={s.key}>
            <h2>{s.title}</h2>
            <div className="grid">{list.map((i) => <Card key={i.id} i={i} ref_={ref_} />)}</div>
          </section>
        );
      })}

      {brief.voices.length > 0 && (
        <section>
          <h2>Voices</h2>
          <div className="voices">
            {brief.voices.map((v) => (
              <figure key={v.url}>
                <a href={v.url} target="_blank" rel="noopener"><blockquote>{v.quote}</blockquote></a>
                <figcaption>@{v.handle}</figcaption>
                {v.bestReply && <a className="reply" href={v.bestReply.url} target="_blank" rel="noopener">↳ {v.bestReply.quote} <span>@{v.bestReply.handle}</span></a>}
              </figure>
            ))}
          </div>
        </section>
      )}

      <footer><a href="/archive/">Archive</a></footer>
    </main>
  );
}
