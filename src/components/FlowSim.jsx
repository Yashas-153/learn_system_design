import { useEffect, useState } from "react";
import { kinds } from "../data/curriculum";

const W = 720;
const TOP = 62;
const ROW = 42;

// Step-through sequence diagram. Before the first step it shows the whole flow dimmed as an overview.
export default function FlowSim({ scenarios }) {
  const [si, setSi] = useState(0);
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);

  const { actors, steps, intro } = scenarios[si];
  const atEnd = step >= steps.length - 1;
  const running = playing && !atEnd;
  const colW = W / actors.length;
  const x = (id) => colW * (actors.findIndex((a) => a.id === id) + 0.5);
  const height = TOP + steps.length * ROW + 14;

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => setStep((n) => n + 1), step < 0 ? 300 : 2200);
    return () => clearTimeout(timer);
  }, [running, step]);

  const go = (n) => {
    setPlaying(false);
    setStep(Math.max(-1, Math.min(steps.length - 1, n)));
  };
  const pick = (i) => {
    setSi(i);
    setStep(-1);
    setPlaying(false);
  };
  const play = () => {
    if (atEnd) setStep(-1);
    setPlaying(!running);
  };

  return (
    <div className="sim">
      {scenarios.length > 1 && (
        <div className="sim-tabs" role="tablist">
          {scenarios.map((sc, i) => (
            <button key={sc.name} role="tab" aria-selected={i === si} className={i === si ? "active" : ""} onClick={() => pick(i)}>
              {sc.name}
            </button>
          ))}
        </div>
      )}

      <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={`Sequence diagram: ${scenarios[si].name}`}>
        {actors.map((a) => (
          <g key={a.id} className={`k-${a.kind}`}>
            <line x1={x(a.id)} y1={44} x2={x(a.id)} y2={height - 6} className="sim-lifeline" />
            <rect x={x(a.id) - Math.min(75, colW / 2 - 6)} y={8} width={Math.min(150, colW - 12)} height={36} rx={8} className="sim-actor" />
            <text x={x(a.id)} y={31} className="sim-actor-label">
              {a.label}
            </text>
          </g>
        ))}

        {steps.map((st, i) => {
          const y = TOP + i * ROW + 26;
          const state = step < 0 ? "overview" : i < step ? "past" : i === step ? "current" : "future";
          const cls = `sim-step ${state} ${st.fail ? "fail" : ""}`;

          if (st.from === st.to) {
            const cx = Math.max(112, Math.min(W - 112, x(st.from)));
            return (
              <g key={i} className={cls}>
                <rect x={cx - 108} y={y - 15} width={216} height={26} rx={13} className="sim-self" />
                <text x={cx} y={y + 2} className="sim-label">
                  {st.label}
                </text>
              </g>
            );
          }

          const x1 = x(st.from);
          const dir = Math.sign(x(st.to) - x1);
          const x2 = st.fail ? x1 + (x(st.to) - x1) * 0.62 : x(st.to) - dir * 3;
          return (
            <g key={i} className={cls}>
              <line x1={x1} y1={y} x2={x2 - (st.fail ? 0 : dir * 8)} y2={y} className="sim-arrow" />
              {st.fail ? (
                <text x={x2 + dir * 9} y={y + 5} className="sim-cross">
                  ✕
                </text>
              ) : (
                <polygon points={`${x2},${y} ${x2 - dir * 10},${y - 5} ${x2 - dir * 10},${y + 5}`} className="sim-head" />
              )}
              <text x={(x1 + x(st.to)) / 2} y={y - 8} className="sim-label">
                {st.label}
              </text>
              {state === "current" && (
                <circle key={`${si}-${step}`} cx={x1} cy={y} r={5.5} className="sim-dot" style={{ "--dx": `${x2 - x1}px` }} />
              )}
            </g>
          );
        })}
      </svg>

      <div className="sim-note" aria-live="polite">
        {step < 0 ? (
          <>
            <strong>Overview.</strong> {intro} Press Play, or step through with Next.
          </>
        ) : (
          <>
            <strong>
              Step {step + 1} of {steps.length}.
            </strong>{" "}
            {steps[step].note}
          </>
        )}
      </div>

      <div className="sim-controls">
        <button onClick={play} className="primary">
          {running ? "Pause" : atEnd ? "Replay" : "Play"}
        </button>
        <button onClick={() => go(step - 1)} disabled={step < 0}>
          Back
        </button>
        <button onClick={() => go(step + 1)} disabled={atEnd}>
          Next
        </button>
        <button onClick={() => go(-1)} disabled={step < 0}>
          Reset
        </button>
        <span className="sim-legend">
          {kinds
            .filter(([k]) => actors.some((a) => a.kind === k))
            .map(([k, label]) => (
              <span key={k} className={`chip k-${k}`}>
                {label}
              </span>
            ))}
        </span>
      </div>
    </div>
  );
}
