import { weeks, allLessons } from "../data/curriculum";

const pages = [
  ["roadmap", "12-week roadmap"],
  ["graph", "Dependency graph"],
  ["guide", "How this course works"],
  ["resources", "Resources"],
];

export default function Sidebar({ view, id, done }) {
  const doneCount = allLessons.filter((l) => done.has(l.id)).length;
  const currentWeek = allLessons.find((l) => l.id === id)?.week ?? 1;

  return (
    <nav className="sidebar" aria-label="Course">
      <ul className="page-links">
        {pages.map(([key, label]) => (
          <li key={key}>
            <a href={`#/${key}`} className={view === key ? "active" : ""}>
              {label}
            </a>
          </li>
        ))}
      </ul>

      <div className="progress-header">
        <strong>{doneCount}</strong> / {allLessons.length} lessons done
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(doneCount / allLessons.length) * 100}%` }} />
        </div>
      </div>

      {weeks.map((w) => (
        <details key={w.n} open={w.n === currentWeek} className="week-block">
          <summary>
            <span className={`dot ph-${w.phase}`} />
            Week {w.n} · {w.short}
            <span className="count">
              {w.lessons.filter((l) => done.has(l.id)).length}/{w.lessons.length}
            </span>
          </summary>
          <ol>
            {w.lessons.map((l) => (
              <li key={l.id}>
                <a href={`#/lesson/${l.id}`} className={`${id === l.id ? "active" : ""} ${done.has(l.id) ? "done" : ""}`}>
                  {l.title}
                  {done.has(l.id) && <span className="check">✓</span>}
                </a>
              </li>
            ))}
          </ol>
        </details>
      ))}
    </nav>
  );
}
