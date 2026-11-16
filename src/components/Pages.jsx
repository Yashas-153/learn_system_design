import { weeks, phases, kinds, resources, lessonStatus } from "../data/curriculum";
import DependencyGraph from "./DependencyGraph";

const statusLabel = { ready: "ready", draft: "draft", outline: "outline" };

export function Roadmap({ done }) {
  return (
    <article className="page">
      <p className="eyebrow">12 weeks · 6 lessons and a checkpoint per week · 60–90 minutes a day</p>
      <h1>Roadmap: zero to SDE-2 system design</h1>
      <p className="lede">
        Five phases. Each week has learning objectives, six daily lessons and a checkpoint with a quiz, a build project and a mock interview
        question. Week 1 is complete; later weeks are outlined and get written as you reach them.
      </p>
      {weeks.map((w, i) => (
        <div key={w.n}>
          {weeks[i - 1]?.phase !== w.phase && <h2 className={`phase-heading ph-${w.phase}`}>{phases[w.phase]}</h2>}
          <section className="week-card">
            <header>
              <h3>
                Week {w.n} — {w.title}
              </h3>
              <span className="count">
                {w.lessons.filter((l) => done.has(l.id)).length} / {w.lessons.length} done
              </span>
            </header>
            <div className="week-cols">
              <div>
                <h4>You will be able to</h4>
                <ul>
                  {w.objectives.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>Daily lessons</h4>
                <ol>
                  {w.lessons.map((l) => (
                    <li key={l.id} className={done.has(l.id) ? "done" : ""}>
                      <a href={`#/lesson/${l.id}`}>{l.title}</a> <span className={`tag tag-${lessonStatus(l)}`}>{statusLabel[lessonStatus(l)]}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>
        </div>
      ))}
    </article>
  );
}

export function GraphPage({ done }) {
  return (
    <article className="page">
      <p className="eyebrow">Prerequisite map</p>
      <h1>What depends on what</h1>
      <p className="lede">
        An arrow from A to B means: finish A before starting B. Click a week to open its first lesson. Inside a week, every lesson lists the
        lessons it builds on.
      </p>
      <div className="diagram">
        <DependencyGraph done={done} />
      </div>
      <p className="chips">
        {Object.entries(phases).map(([key, label]) => (
          <span key={key} className={`chip ph-${key}`}>
            {label}
          </span>
        ))}
      </p>
      <h2>How to read it</h2>
      <ul>
        <li>
          <strong>The top row is one chain.</strong> Networking → storage → distributed data → asynchronous systems → resilience. Each week
          uses the vocabulary of the one before, so do not skip ahead here.
        </li>
        <li>
          <strong>Low-level design is a separate track.</strong> Week 7 has no prerequisites. If you want variety, you can start it alongside
          Weeks 3–5. Week 8 needs the concurrency lesson from Week 2.
        </li>
        <li>
          <strong>Practice weeks come after their method week.</strong> HLD problems (Weeks 9–10) need the framework from Week 6; LLD problems
          (Week 11) need the patterns from Week 8.
        </li>
        <li>
          <strong>Week 12 needs everything.</strong> Full mock interviews mix both tracks.
        </li>
      </ul>
    </article>
  );
}

const anatomy = [
  ["Intuition", "The idea in plain words, before any jargon."],
  ["Real-life analogy", "Something familiar to hang the idea on."],
  ["The problem it solves", "Why engineers needed it. No technology is introduced without its reason."],
  ["How it works inside", "The actual mechanism, step by step."],
  ["See it happen", "An interactive simulation: play it, step through it, switch to the failure scenario."],
  ["Code", "A small runnable example in Python, Java or C++."],
  ["In production", "How real companies use it, with links to their own write-ups."],
  ["Trade-offs", "When to use it, when not to, and the alternatives."],
  ["Interview perspective", "What an SDE-2 interviewer listens for."],
  ["Practice", "Warm-up, core and stretch questions with answer outlines."],
];

export function Guide() {
  return (
    <article className="page">
      <p className="eyebrow">Learning architecture</p>
      <h1>How this course works</h1>
      <p className="lede">
        The goal is not to collect notes. It is to be able to think through a design, draw it, explain it and defend it. Everything here is
        organised around that.
      </p>

      <h2>Navigation</h2>
      <ul>
        <li>
          <strong>Roadmap</strong> — all 12 weeks with objectives and daily lessons. Start here each week.
        </li>
        <li>
          <strong>Dependency graph</strong> — which weeks unlock which.
        </li>
        <li>
          <strong>Sidebar</strong> — every lesson by week and day, with your progress. Progress is saved in this browser.
        </li>
        <li>
          <strong>Resources</strong> — the books, papers and engineering blogs the lessons draw on.
        </li>
      </ul>

      <h2>Every lesson has the same ten parts</h2>
      <ol className="anatomy">
        {anatomy.map(([name, what]) => (
          <li key={name}>
            <strong>{name}.</strong> {what}
          </li>
        ))}
      </ol>

      <h2>The weekly rhythm</h2>
      <ul>
        <li>
          <strong>Days 1–6:</strong> one lesson a day, 60–90 minutes. Read parts 1–4, run the simulation until you can predict each step, type
          the code yourself, then do the practice questions before opening the answers.
        </li>
        <li>
          <strong>Day 7, the checkpoint:</strong> a one-page cheat sheet, a quiz, a small build project and a mock interview question with a
          scoring rubric. Move to the next week only when the mastery list is true for you.
        </li>
      </ul>

      <h2>How to study so that it sticks</h2>
      <ul>
        <li>
          <strong>Recall before you reread.</strong> Close the lesson and explain the concept aloud, or draw the diagram from memory. This is
          uncomfortable and it is what works.
        </li>
        <li>
          <strong>Predict the simulation.</strong> Before pressing Next, say what the next arrow will be. Wrong guesses show you exactly what
          you have not understood yet.
        </li>
        <li>
          <strong>Always ask "what if this fails?"</strong> Every simulation set includes a failure scenario. Interviews at SDE-2 level are
          mostly about that question.
        </li>
        <li>
          <strong>Speak your answers.</strong> Interviews test communication. Record the mock question and score yourself against the rubric.
        </li>
      </ul>

      <h2>Colour language</h2>
      <p>Every simulation uses the same colours, so a diagram reads at a glance:</p>
      <p className="chips">
        {kinds.map(([k, label]) => (
          <span key={k} className={`chip k-${k}`}>
            {label}
          </span>
        ))}
      </p>

      <h2>Lesson status</h2>
      <p className="chips">
        <span className="tag tag-ready">ready</span> full 10-part lesson · <span className="tag tag-draft">draft</span> an earlier, shorter
        version that will be rebuilt · <span className="tag tag-outline">outline</span> title only, written when you reach that week
      </p>
    </article>
  );
}

export function Resources() {
  return (
    <article className="page">
      <p className="eyebrow">Curated sources</p>
      <h1>Resources</h1>
      <p className="lede">The material this course is built on. Each lesson also links the specific sources it used.</p>
      {resources.map((g) => (
        <section key={g.group}>
          <h2>{g.group}</h2>
          <ul>
            {g.items.map((r) => (
              <li key={r.title}>
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.title}
                  </a>
                ) : (
                  <strong>{r.title}</strong>
                )}
                {r.note && <> — {r.note}</>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}
