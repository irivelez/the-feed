"use client";
import { useState } from "react";

const MOMENTUM = {
  new: { label: "New today", icon: "🆕" },
  building: { label: "Building this week", icon: "📈" },
  shift: { label: "Shift this month", icon: "🧭" },
};
const LENS = { practical: "Practical", broad: "Broad picture", "frontier-capital": "Frontier capital", design: "Design" };
// Lenses shown in their own section, apart from the daily AI news. Hidden when empty.
const SECTIONS = [
  { lens: "frontier-capital", title: "Frontier capital: views from the world's quiet investors" },
  { lens: "design", title: "Design" },
];
const NEWS = new Set(["practical", "broad"]);

function Card({ i }) {
  return (
    <article className="card">
      {i.image && <a href={i.source.url} target="_blank" rel="noopener"><img src={i.image.src} alt={i.image.alt} loading="lazy" /></a>}
      <div className="body">
        <div className="badges"><span className="m">{MOMENTUM[i.momentum].icon} {MOMENTUM[i.momentum].label}</span><span className={`lens ${i.lens}`}>{LENS[i.lens]}</span></div>
        <h3>{i.title}</h3>
        <p className="takeaway">{i.takeaway}</p>
        <p className="sowhat"><strong>So what:</strong> {i.soWhat}</p>
        <div className="foot"><a href={i.source.url} target="_blank" rel="noopener">{i.source.name} ↗</a><time>{fmt(i.publishedAt)}</time></div>
      </div>
    </article>
  );
}

function fmt(iso) {
  return new Date(iso).toLocaleString("en-US", { timeZone: "America/Bogota", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) + " COT";
}

export default function Brief({ brief, archive }) {
  const [filter, setFilter] = useState("all");
  const byId = Object.fromEntries(brief.items.map((i) => [i.id, i]));
  const sorted = [...brief.items].sort((a, b) => b.importance - a.importance);
  const items = sorted.filter((i) => NEWS.has(i.lens) && (filter === "all" || i.momentum === filter));
  return (
    <main>
      <header className="masthead">
        <div className="brand">Signal Brief</div>
        <div className="meta">{brief.edition} edition · {fmt(brief.publishedAt)}</div>
        <p className="tag">Agentic AI in practice, and the big picture, for leaders with five minutes.</p>
      </header>

      <section className="top3" aria-label="Top 3">
        <h2>Top 3</h2>
        <ol>
          {brief.top3.map((t) => (
            <li key={t.itemId}>
              <a href={byId[t.itemId]?.source.url} target="_blank" rel="noopener"><strong>{t.headline}</strong></a>
              <p><span className="why">Why it matters for leaders:</span> {t.whyItMatters}</p>
            </li>
          ))}
        </ol>
      </section>

      <nav className="chips" aria-label="Momentum filter">
        <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>All</button>
        {Object.entries(MOMENTUM).map(([k, m]) => (
          <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{m.icon} {m.label}</button>
        ))}
      </nav>

      <section className="cards">
        {items.map((i) => <Card key={i.id} i={i} />)}
        {items.length === 0 && <p className="empty">Nothing with this tag in this edition.</p>}
      </section>

      {SECTIONS.map(({ lens, title }) => {
        const list = sorted.filter((i) => i.lens === lens);
        return list.length > 0 && (
          <section key={lens} className={`lane ${lens}`} aria-label={title}>
            <h2>{title}</h2>
            <div className="cards">{list.map((i) => <Card key={i.id} i={i} />)}</div>
          </section>
        );
      })}

      {brief.voices.length > 0 && (
        <section className="voices" aria-label="Voices">
          <h2>Voices</h2>
          <div className="strip">
            {brief.voices.map((v) => (
              <figure key={v.url}>
                <blockquote><a href={v.url} target="_blank" rel="noopener">“{v.quote}”</a></blockquote>
                <figcaption>@{v.handle}</figcaption>
                {v.bestReply && (
                  <div className="reply"><span>Best reply</span> <a href={v.bestReply.url} target="_blank" rel="noopener">“{v.bestReply.quote}”</a> <em>@{v.bestReply.handle}</em></div>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      <footer>
        <h2>Archive</h2>
        <ul className="archive">
          {archive.map((id) => <li key={id}><a href={`/archive/${id}/`}>{id.slice(0, 10)} {id.slice(11, 13)}:{id.slice(13)}</a></li>)}
        </ul>
        <p className="small">Curated by Irina Vélez from trusted sources. Every item links its original source.</p>
      </footer>
    </main>
  );
}
