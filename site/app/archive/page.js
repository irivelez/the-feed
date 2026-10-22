import { index } from "../../lib/api";
export const metadata = { title: "Archive · Signal Brief" };
const label = (b) => new Date(b.publishedAt).toLocaleDateString("en-US", { timeZone: "America/Bogota", weekday: "short", month: "short", day: "numeric", year: "numeric" });
export default function Archive() {
  return (
    <main>
      <header><h1>Archive</h1><p><a href="/">Latest</a></p></header>
      <ul className="arch">
        {index().briefs.map((b) => (
          <li key={b.id}><a href={`/archive/${b.id}/`}><small>{label(b)} · {b.edition}</small><span>{b.headline}</span></a></li>
        ))}
      </ul>
    </main>
  );
}
