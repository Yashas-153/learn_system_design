import { weeks } from "../data/curriculum";

const NW = 140;
const NH = 48;

// Line between two node centres, clipped to the node borders.
function edge(a, b) {
  const [ax, ay, bx, by] = [a.x + NW / 2, a.y + NH / 2, b.x + NW / 2, b.y + NH / 2];
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.min(NW / 2 / Math.abs(dx || 1e-9), NH / 2 / Math.abs(dy || 1e-9));
  return { x1: ax + dx * t, y1: ay + dy * t, x2: bx - dx * (t + 4 / Math.hypot(dx, dy)), y2: by - dy * (t + 4 / Math.hypot(dx, dy)) };
}

export default function DependencyGraph({ done }) {
  const byN = Object.fromEntries(weeks.map((w) => [w.n, w]));
  return (
    <svg viewBox="0 0 800 425" className="graph" role="img" aria-label="Prerequisite graph of the 12 weeks">
      <defs>
        <marker id="g-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0L10 5L0 10z" className="graph-head" />
        </marker>
      </defs>
      {weeks.flatMap((w) =>
        w.prereqs.map((p) => <line key={`${p}-${w.n}`} {...edge(byN[p].pos, w.pos)} className="graph-edge" markerEnd="url(#g-arrow)" />)
      )}
      {weeks.map((w) => {
        const complete = w.lessons.every((l) => done.has(l.id));
        return (
          <a key={w.n} href={`#/lesson/${w.lessons[0].id}`} className={`graph-node ph-${w.phase}`}>
            <rect x={w.pos.x} y={w.pos.y} width={NW} height={NH} rx={9} />
            <text x={w.pos.x + NW / 2} y={w.pos.y + 20} className="graph-week">
              Week {w.n} {complete ? "✓" : ""}
            </text>
            <text x={w.pos.x + NW / 2} y={w.pos.y + 37} className="graph-title">
              {w.short}
            </text>
          </a>
        );
      })}
    </svg>
  );
}
