import { useState } from "react";
import { allLessons, weeks, lessonStatus } from "../data/curriculum";
import Prose from "./Prose";
import FlowSim from "./FlowSim";

function Section({ n, title, children }) {
  return (
    <section>
      <h2>
        {n && <span className="step-num">{n}</span>}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Code({ blocks }) {
  return blocks.map((b) => (
    <div key={b.title} className="code-block">
      <div className="code-title">
        {b.title} <span>{b.lang}</span>
      </div>
      <pre className="code">
        <code>{b.source}</code>
      </pre>
      {b.explain && <Prose text={b.explain} />}
    </div>
  ));
}

function Sources({ sources }) {
  if (!sources?.length) return null;
  return (
    <Section title="Sources and further reading">
      <ul>
        {sources.map((s) => (
          <li key={s.title}>
            {s.url ? (
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.title}
              </a>
            ) : (
              s.title
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}

function FullBody({ lesson }) {
  return (
    <>
      <Section n={1} title="Intuition">
        <Prose text={lesson.intuition} />
      </Section>
      <Section n={2} title="Real-life analogy">
        <div className="callout">
          <Prose text={lesson.analogy} />
        </div>
      </Section>
      <Section n={3} title="The problem it solves">
        <Prose text={lesson.problem} />
      </Section>
      <Section n={4} title="How it works inside">
        <Prose text={lesson.internals} />
      </Section>
      <Section n={5} title="See it happen">
        <FlowSim scenarios={lesson.sim} />
      </Section>
      <Section n={6} title="Code">
        <Code blocks={lesson.code} />
      </Section>
      <Section n={7} title="In production">
        <Prose text={lesson.production} />
      </Section>
      <Section n={8} title="Trade-offs">
        <Prose text={lesson.tradeoffs} />
      </Section>
      <Section n={9} title="Interview perspective">
        <div className="callout interview">
          <Prose text={lesson.interview} />
        </div>
      </Section>
      <Section n={10} title="Practice">
        <ol className="practice">
          {lesson.practice.map((p) => (
            <li key={p.q}>
              <span className={`level level-${p.level.toLowerCase()}`}>{p.level}</span>
              <Prose text={p.q} />
              <details>
                <summary>Show answer outline</summary>
                <Prose text={p.a} />
              </details>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}

function Quiz({ questions }) {
  const [picked, setPicked] = useState({});
  const score = questions.filter((q, i) => picked[i] === q.answer).length;
  const answered = Object.keys(picked).length;
  return (
    <div className="quiz">
      {questions.map((q, i) => (
        <fieldset key={q.q}>
          <legend>
            {i + 1}. {q.q}
          </legend>
          {q.options.map((opt, j) => {
            const shown = picked[i] !== undefined;
            const cls = shown && j === q.answer ? "right" : shown && j === picked[i] ? "wrong" : "";
            return (
              <button key={opt} className={cls} disabled={shown} onClick={() => setPicked({ ...picked, [i]: j })}>
                {opt}
              </button>
            );
          })}
          {picked[i] !== undefined && (
            <p className="quiz-why">
              <strong>{picked[i] === q.answer ? "Correct." : "Not quite."}</strong> {q.why}
            </p>
          )}
        </fieldset>
      ))}
      <p className="quiz-score" aria-live="polite">
        Score: {score} / {questions.length}
        {answered === questions.length && (
          <>
            {" — "}
            <button className="linkish" onClick={() => setPicked({})}>
              try again
            </button>
          </>
        )}
      </p>
    </div>
  );
}

function CheckpointBody({ lesson }) {
  return (
    <>
      <Section title="Cheat sheet">
        <div className="callout">
          <Prose text={lesson.cheatSheet} />
        </div>
      </Section>
      <Section title="Quiz">
        <Quiz questions={lesson.quiz} />
      </Section>
      <Section title={lesson.project.title}>
        {lesson.project.parts.map(([heading, text]) => (
          <div key={heading}>
            <h3>{heading}</h3>
            <Prose text={text} />
          </div>
        ))}
      </Section>
      <Section title="Mock interview question">
        <div className="callout interview">
          <p className="mock-q">{lesson.mock.question}</p>
          <p>{lesson.mock.how}</p>
        </div>
        <h3>Evaluation rubric</h3>
        <table className="rubric">
          <tbody>
            {lesson.mock.rubric.map(([level, text]) => (
              <tr key={level}>
                <th scope="row">{level}</th>
                <td>{text}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Follow-up questions, in rising difficulty</h3>
        <ol>
          {lesson.mock.followUps.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ol>
      </Section>
      <Section title="Mastery check — move on when all of these are true">
        <ul className="mastery">
          {lesson.mastery.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </Section>
    </>
  );
}

// v1 lessons written before the 10-part format.
function LegacyBody({ lesson }) {
  return (
    <>
      <p className="status-note">
        This is a first-draft lesson. It will be rebuilt in the full 10-part format, with simulations and code, when you reach Week {lesson.week}.
      </p>
      <section className="callout">
        <h2>Why this exists</h2>
        <Prose text={lesson.why} />
      </section>
      <Section title="Concept">
        <Prose text={lesson.concept} />
      </Section>
      <Section title="Visualisation">
        {/* diagram is our own static SVG content, not user input */}
        <div className="diagram" dangerouslySetInnerHTML={{ __html: lesson.diagram }} />
      </Section>
      <Section title="Example">
        <Prose text={lesson.example} />
      </Section>
      <Section title="Real-world use cases">
        <ul>
          {lesson.useCases.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      </Section>
      <Section title="Practice">
        <ol>
          {lesson.practice.map((q) => (
            <li key={q}>
              <Prose text={q} />
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}

export default function LessonView({ id, done, toggle }) {
  const index = allLessons.findIndex((l) => l.id === id);
  const lesson = allLessons[index];
  if (!lesson) return <p>Lesson not found. Pick one from the sidebar.</p>;

  const next = allLessons[index + 1];
  const week = weeks[lesson.week - 1];
  const status = lessonStatus(lesson);
  const prereqs = (lesson.prereqs ?? []).map((p) => allLessons.find((l) => l.id === p));

  return (
    <article className="lesson">
      <p className="eyebrow">
        Week {lesson.week} · Day {lesson.day}
        {lesson.minutes && ` · about ${lesson.minutes} min`} · {week.short}
      </p>
      <h1>{lesson.title}</h1>
      {prereqs.length > 0 && (
        <p className="links-row">
          Builds on:{" "}
          {prereqs.map((p, i) => (
            <span key={p.id}>
              {i > 0 && ", "}
              <a href={`#/lesson/${p.id}`}>{p.title}</a>
            </span>
          ))}
        </p>
      )}

      {status === "ready" && (lesson.checkpoint ? <CheckpointBody lesson={lesson} /> : <FullBody lesson={lesson} />)}
      {status === "draft" && <LegacyBody lesson={lesson} />}
      {status === "outline" && (
        <p className="status-note">
          This lesson is outlined but not written yet. The curriculum is being built one week at a time, so its full content arrives when you
          reach Week {lesson.week}.
        </p>
      )}

      <Sources sources={lesson.sources} />

      <footer className="lesson-footer">
        <label className="done-toggle">
          <input type="checkbox" checked={done.has(lesson.id)} onChange={() => toggle(lesson.id)} />
          Mark as done
        </label>
        {next && (
          <a href={`#/lesson/${next.id}`} className="next-link">
            Next: {next.title} →
          </a>
        )}
      </footer>
    </article>
  );
}
