import { evidenceItem } from "../lib/api";

export default function Narrative({ n, currentBriefId }) {
  if (!n) return null;
  return (
    <section className="narrative" aria-label="This week">
      <h2>This week</h2>
      <p className="nh">{n.headline}</p>
      <p className="ns">{n.summary}</p>
      <ol className="threads">
        {n.threads.map((t) => (
          <li key={t.title}>
            <h3>{t.title}</h3>
            <p>{t.line}</p>
            <div className="ev">
              {t.evidence.map((e) => {
                const i = evidenceItem(e.briefId, e.itemId);
                if (!i) return null;
                const href = e.briefId === currentBriefId ? `#${i.id}` : `/archive/${e.briefId}/#${i.id}`;
                return <a key={e.briefId + e.itemId} href={href} title={i.title}>{i.image && <img src={i.image.src} alt="" loading="lazy" />}<span>{i.title}</span></a>;
              })}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
