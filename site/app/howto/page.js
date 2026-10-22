import Nav from "../Nav";
import CopyButton from "../CopyButton";
import { howtos } from "../../lib/api";
export const metadata = { title: "How-to · Signal Brief" };

export default function HowTo() {
  const list = howtos();
  return (
    <main>
      <Nav here="howto" />
      {list.length === 0 ? <p className="empty">Nothing here yet.</p> : (
        <div className="howtos">
          {list.map((h) => {
            const text = h.kind === "prompt" ? h.copy[0] : h.copy.map((s, k) => `${k + 1}. ${s}`).join("\n");
            return (
              <article key={h.id} id={h.id} className="howto">
                <div className="tags">{h.tags.map((t) => <span key={t}>{t.replace(/-/g, " ")}</span>)}</div>
                <h3>{h.title}</h3>
                <p className="what">{h.what}</p>
                <div className="box">
                  {h.kind === "prompt" ? <pre>{h.copy[0]}</pre> : <ol>{h.copy.map((s, k) => <li key={k}>{s}</li>)}</ol>}
                  <CopyButton text={text} />
                </div>
                <p className="when"><b>When</b> {h.whenToUse}</p>
                <small><a href={h.source.url} target="_blank" rel="noopener">{h.author.name} ↗</a></small>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
