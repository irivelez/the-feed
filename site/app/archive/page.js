import Nav from "../Nav";
import { index } from "../../lib/api";
export const metadata = { title: "Archive · Signal Brief" };
const label = (b) => new Date(b.publishedAt).toLocaleDateString("en-US", { timeZone: "America/Bogota", weekday: "short", month: "short", day: "numeric", year: "numeric" });
export default function Archive() {
  return (
    <main>
      <Nav here="archive" />
      <ul className="arch">
        {index().briefs.map((b) => (
          <li key={b.id}><a href={`/archive/${b.id}/`}><small>{label(b)} · {b.edition}</small><span>{b.headline}</span></a></li>
        ))}
      </ul>
    </main>
  );
}
